use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use deadpool_postgres::Pool;
use medical_product_search::db::{self, DbError};
use medical_product_search::{NameSearch, PznSearch};
use serde::Deserialize;

#[derive(Clone)]
struct AppState {
    pool: Pool,
}

#[derive(Deserialize)]
struct NameQuery {
    #[serde(default)]
    q: String,
    #[serde(default = "first_page")]
    page: u32,
}

#[derive(Deserialize)]
struct PznQuery {
    #[serde(default)]
    pzn: String,
}

fn first_page() -> u32 {
    1
}

#[tokio::main]
async fn main() {
    let database_url = required_env("DATABASE_URL");
    let bind = std::env::var("BIND").unwrap_or_else(|_| "0.0.0.0:8080".to_owned());
    db::ensure_schema(&database_url)
        .await
        .unwrap_or_else(|error| {
            eprintln!("{error}");
            std::process::exit(1);
        });
    let pool = db::pool(&database_url).unwrap_or_else(|error| {
        eprintln!("{error}");
        std::process::exit(1);
    });
    let app = router(pool);
    let listener = tokio::net::TcpListener::bind(&bind).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

fn required_env(name: &str) -> String {
    match std::env::var(name) {
        Ok(value) if !value.trim().is_empty() => value,
        _ => {
            eprintln!("{name} is required");
            std::process::exit(1);
        }
    }
}

fn router(pool: Pool) -> Router {
    Router::new()
        .route("/search/name", get(search_name))
        .route("/search/name/", get(search_name))
        .route("/search/pzn", get(search_pzn))
        .route("/search/pzn/", get(search_pzn))
        .with_state(AppState { pool })
}

async fn search_name(
    State(state): State<AppState>,
    Query(query): Query<NameQuery>,
) -> Result<Json<NameSearch>, StatusCode> {
    db::search_name(&state.pool, &query.q, query.page)
        .await
        .map(Json)
        .map_err(status_for_db)
}

async fn search_pzn(
    State(state): State<AppState>,
    Query(query): Query<PznQuery>,
) -> Result<Json<PznSearch>, StatusCode> {
    db::search_pzn(&state.pool, &query.pzn)
        .await
        .map(Json)
        .map_err(status_for_db)
}

fn status_for_db(error: DbError) -> StatusCode {
    eprintln!("{error}");
    StatusCode::INTERNAL_SERVER_ERROR
}
