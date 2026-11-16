use std::path::Path;
use std::time::{Duration, Instant};

use deadpool_postgres::Pool;
use tokio_postgres::NoTls;

use crate::{
    load_dataset, search_by_name, search_by_pzn, Dataset, LoadError, NameSearch, Product, PznSearch,
};

const CONNECT_WAIT: Duration = Duration::from_secs(60);
const INSERT_CHUNK: usize = 1_000;

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
    ingredient text NOT NULL
);
CREATE INDEX IF NOT EXISTS products_pzn_idx ON products (pzn);
CREATE INDEX IF NOT EXISTS products_name_trgm ON products USING gin (lower(name) gin_trgm_ops);
";

#[derive(Debug)]
pub enum DbError {
    Connect(tokio_postgres::Error),
    Pool(deadpool_postgres::PoolError),
    Query(tokio_postgres::Error),
    Config(String),
    MissingDataset,
    Load(LoadError),
}

impl std::fmt::Display for DbError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Connect(error) => write!(formatter, "postgres connection failed: {error}"),
            Self::Pool(error) => write!(formatter, "postgres pool failed: {error}"),
            Self::Query(error) => write!(formatter, "postgres query failed: {error}"),
            Self::Config(message) => write!(formatter, "invalid database configuration: {message}"),
            Self::MissingDataset => write!(formatter, "dataset is not loaded"),
            Self::Load(error) => write!(formatter, "failed to read dataset files: {error}"),
        }
    }
}

impl std::error::Error for DbError {}

impl From<tokio_postgres::Error> for DbError {
    fn from(error: tokio_postgres::Error) -> Self {
        Self::Query(error)
    }
}

impl From<LoadError> for DbError {
    fn from(error: LoadError) -> Self {
        Self::Load(error)
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

pub async fn import_dataset(database_url: &str, data_dir: &Path) -> Result<usize, DbError> {
    let dataset = load_dataset(data_dir)?;
    let mut client = connect(database_url).await?;
    client.batch_execute(SCHEMA).await?;
    let transaction = client.transaction().await?;
    transaction.batch_execute("TRUNCATE products").await?;
    transaction
        .execute(
            "INSERT INTO dataset (singleton, date, source) VALUES (TRUE, $1, $2)
             ON CONFLICT (singleton) DO UPDATE SET date = EXCLUDED.date, source = EXCLUDED.source",
            &[&dataset.date, &dataset.source],
        )
        .await?;
    insert_products(&transaction, &dataset.products).await?;
    transaction.commit().await?;
    Ok(dataset.products.len())
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
            "SELECT id, pzn, kind, name, ingredient
             FROM products
             WHERE lower(name) LIKE ALL ($1::text[])",
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
            "SELECT id, pzn, kind, name, ingredient
             FROM products
             WHERE pzn = $1
             ORDER BY id
             LIMIT 1",
            &[&pzn],
        )
        .await?;
    Ok(rows.iter().map(product_from_row).collect())
}

async fn insert_products(
    transaction: &tokio_postgres::Transaction<'_>,
    products: &[Product],
) -> Result<(), DbError> {
    for chunk in products.chunks(INSERT_CHUNK) {
        let mut sql =
            String::from("INSERT INTO products (id, pzn, kind, name, ingredient) VALUES ");
        let mut values: Vec<&(dyn tokio_postgres::types::ToSql + Sync)> =
            Vec::with_capacity(chunk.len() * 5);
        for (index, product) in chunk.iter().enumerate() {
            if index > 0 {
                sql.push_str(", ");
            }
            let offset = index * 5;
            sql.push_str(&format!(
                "(${}, ${}, ${}, ${}, ${})",
                offset + 1,
                offset + 2,
                offset + 3,
                offset + 4,
                offset + 5,
            ));
            values.push(&product.id);
            values.push(&product.pzn);
            values.push(&product.kind);
            values.push(&product.name);
            values.push(&product.ingredient);
        }
        transaction.execute(&sql, &values).await?;
    }
    Ok(())
}

fn product_from_row(row: &tokio_postgres::Row) -> Product {
    Product {
        id: row.get(0),
        pzn: row.get(1),
        kind: row.get(2),
        name: row.get(3),
        ingredient: row.get(4),
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
