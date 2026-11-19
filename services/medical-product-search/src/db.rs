use std::time::{Duration, Instant};

use deadpool_postgres::Pool;
use tokio_postgres::NoTls;

use crate::{search_by_name, search_by_pzn, Dataset, NameSearch, Product, PznSearch};

const CONNECT_WAIT: Duration = Duration::from_secs(60);

const SCHEMA: &str = "
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE IF NOT EXISTS dataset (
    singleton boolean PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    date text NOT NULL,
    source text NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
    id text PRIMARY KEY,
    pzn text NOT NULL,
    kind text NOT NULL,
    name text NOT NULL,
    package_size text
);
CREATE TABLE IF NOT EXISTS substances (
    product_id text NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    id text NOT NULL,
    name text NOT NULL,
    strength text NOT NULL,
    position integer NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, id)
);
CREATE INDEX IF NOT EXISTS products_pzn_idx ON products (pzn);
CREATE INDEX IF NOT EXISTS products_name_trgm ON products USING gin (lower(name) gin_trgm_ops);
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_size text;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'ingredient'
          AND udt_name = 'text'
    ) THEN
        ALTER TABLE products
            ALTER COLUMN ingredient TYPE jsonb
            USING CASE
                WHEN ingredient IS NULL OR btrim(ingredient) = '' THEN '[]'::jsonb
                WHEN left(btrim(ingredient), 1) = '[' THEN ingredient::jsonb
                ELSE jsonb_build_array(jsonb_build_object('id', id, 'name', ingredient, 'strength', ''))
            END;
    END IF;
END $$;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'ingredient'
    ) THEN
        INSERT INTO substances (product_id, id, name, strength, position)
        SELECT
            products.id,
            COALESCE(NULLIF(item->>'id', ''), products.id || '-' || ordinality::text),
            COALESCE(item->>'name', ''),
            COALESCE(item->>'strength', ''),
            ordinality::integer
        FROM products
        CROSS JOIN LATERAL jsonb_array_elements(
            CASE
                WHEN jsonb_typeof(ingredient) = 'array' THEN ingredient
                ELSE '[]'::jsonb
            END
        ) WITH ORDINALITY AS elements(item, ordinality)
        ON CONFLICT (product_id, id) DO NOTHING;
        ALTER TABLE products DROP COLUMN ingredient;
    END IF;
END $$;
";

#[derive(Debug)]
pub enum DbError {
    Connect(tokio_postgres::Error),
    Pool(deadpool_postgres::PoolError),
    Query(tokio_postgres::Error),
    Config(String),
    MissingDataset,
}

impl std::fmt::Display for DbError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Connect(error) => write!(formatter, "postgres connection failed: {error}"),
            Self::Pool(error) => write!(formatter, "postgres pool failed: {error}"),
            Self::Query(error) => write!(formatter, "postgres query failed: {error}"),
            Self::Config(message) => write!(formatter, "invalid database configuration: {message}"),
            Self::MissingDataset => write!(formatter, "dataset is not loaded"),
        }
    }
}

impl std::error::Error for DbError {}

impl From<tokio_postgres::Error> for DbError {
    fn from(error: tokio_postgres::Error) -> Self {
        Self::Query(error)
    }
}

pub fn pool(database_url: &str) -> Result<Pool, DbError> {
    let config = database_url.parse::<tokio_postgres::Config>()?;
    let manager = deadpool_postgres::Manager::from_config(
        config,
        NoTls,
        deadpool_postgres::ManagerConfig {
            recycling_method: deadpool_postgres::RecyclingMethod::Fast,
        },
    );
    Pool::builder(manager)
        .max_size(16)
        .build()
        .map_err(|error| DbError::Config(error.to_string()))
}

pub async fn ensure_schema(database_url: &str) -> Result<(), DbError> {
    let client = connect(database_url).await?;
    client.batch_execute(SCHEMA).await?;
    Ok(())
}

pub async fn search_name(pool: &Pool, query: &str, page: u32) -> Result<NameSearch, DbError> {
    let client = pool.get().await.map_err(DbError::Pool)?;
    let (date, source) = dataset_meta(&client).await?;
    let tokens = name_tokens(query);
    let products = if tokens.is_empty() {
        Vec::new()
    } else {
        products_for_tokens(&client, &tokens).await?
    };
    Ok(search_by_name(
        &Dataset {
            date,
            source,
            products,
        },
        query,
        page,
    ))
}

pub async fn search_pzn(pool: &Pool, pzn: &str) -> Result<PznSearch, DbError> {
    let client = pool.get().await.map_err(DbError::Pool)?;
    let (date, source) = dataset_meta(&client).await?;
    let needle = pzn.trim();
    let products = product_for_pzn(&client, needle).await?;
    Ok(search_by_pzn(
        &Dataset {
            date,
            source,
            products,
        },
        needle,
    ))
}

async fn connect(database_url: &str) -> Result<tokio_postgres::Client, DbError> {
    let config = database_url.parse::<tokio_postgres::Config>()?;
    let deadline = Instant::now() + CONNECT_WAIT;
    loop {
        match config.connect(NoTls).await {
            Ok((client, connection)) => {
                tokio::spawn(async move {
                    if let Err(error) = connection.await {
                        eprintln!("postgres connection closed: {error}");
                    }
                });
                return Ok(client);
            }
            Err(error) => {
                if Instant::now() >= deadline {
                    return Err(DbError::Connect(error));
                }
                eprintln!("waiting for postgres: {error}");
                tokio::time::sleep(Duration::from_secs(1)).await;
            }
        }
    }
}

async fn dataset_meta(
    client: &impl deadpool_postgres::GenericClient,
) -> Result<(String, String), DbError> {
    let row = client
        .query_opt("SELECT date, source FROM dataset", &[])
        .await?
        .ok_or(DbError::MissingDataset)?;
    Ok((row.get(0), row.get(1)))
}

async fn products_for_tokens(
    client: &impl deadpool_postgres::GenericClient,
    tokens: &[String],
) -> Result<Vec<Product>, DbError> {
    let patterns = tokens
        .iter()
        .map(|token| like_pattern(token))
        .collect::<Vec<_>>();
    let rows = client
        .query(
            "SELECT products.id, products.pzn, products.kind, products.name, products.package_size,
                    COALESCE(json_agg(
                        json_build_object('id', substances.id, 'name', substances.name, 'strength', substances.strength)
                        ORDER BY substances.position, substances.id
                    ) FILTER (WHERE substances.id IS NOT NULL), '[]'::json)::text
             FROM products
             LEFT JOIN substances ON substances.product_id = products.id
             WHERE lower(products.name) LIKE ALL ($1::text[])
             GROUP BY products.id",
            &[&patterns],
        )
        .await?;
    Ok(rows.iter().map(product_from_row).collect())
}

async fn product_for_pzn(
    client: &impl deadpool_postgres::GenericClient,
    pzn: &str,
) -> Result<Vec<Product>, DbError> {
    let rows = client
        .query(
            "SELECT products.id, products.pzn, products.kind, products.name, products.package_size,
                    COALESCE(json_agg(
                        json_build_object('id', substances.id, 'name', substances.name, 'strength', substances.strength)
                        ORDER BY substances.position, substances.id
                    ) FILTER (WHERE substances.id IS NOT NULL), '[]'::json)::text
             FROM products
             LEFT JOIN substances ON substances.product_id = products.id
             WHERE products.pzn = $1
             GROUP BY products.id
             ORDER BY products.id
             LIMIT 1",
            &[&pzn],
        )
        .await?;
    Ok(rows.iter().map(product_from_row).collect())
}

fn product_from_row(row: &tokio_postgres::Row) -> Product {
    let ingredient_json: String = row.get(5);
    let ingredient = serde_json::from_str(&ingredient_json).unwrap_or_default();
    Product {
        id: row.get(0),
        pzn: row.get(1),
        kind: row.get(2),
        name: row.get(3),
        ingredient,
        package_size: package_size(row.get(4)),
    }
}

fn package_size(value: Option<String>) -> Option<String> {
    match value.as_deref().map(str::trim) {
        Some("N1" | "n1") => Some("n1".to_owned()),
        Some("N2" | "n2") => Some("n2".to_owned()),
        Some("N3" | "n3") => Some("n3".to_owned()),
        _ => None,
    }
}

fn name_tokens(query: &str) -> Vec<String> {
    query
        .trim()
        .to_lowercase()
        .split_whitespace()
        .filter(|token| !token.is_empty())
        .map(ToOwned::to_owned)
        .collect()
}

fn like_pattern(token: &str) -> String {
    let mut pattern = String::from("%");
    for character in token.chars() {
        if matches!(character, '\\' | '%' | '_') {
            pattern.push('\\');
        }
        pattern.push(character);
    }
    pattern.push('%');
    pattern
}

#[cfg(test)]
mod tests {
    use super::{like_pattern, name_tokens};

    #[test]
    fn splits_name_tokens() {
        assert!(name_tokens("   ").is_empty());
        assert_eq!(
            name_tokens(" Ibu 400 "),
            vec!["ibu".to_owned(), "400".to_owned()]
        );
    }

    #[test]
    fn escapes_like_wildcards() {
        assert_eq!(like_pattern("a_b%c\\d"), "%a\\_b\\%c\\\\d%");
    }
}
