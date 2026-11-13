use std::path::PathBuf;
use std::sync::Arc;

use axum::extract::{Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use medical_product_search::{load_dataset, search_by_name, search_by_pzn, LoadError, NameSearch, PznSearch};
use serde::Deserialize;

#[derive(Clone)]
struct AppState {
    data_dir: Arc<PathBuf>,
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
    let data_dir = PathBuf::from(std::env::var("DATA_DIR").unwrap_or_else(|_| "./data".to_owned()));
    let bind = std::env::var("BIND").unwrap_or_else(|_| "0.0.0.0:8080".to_owned());
    let app = router(data_dir);
    let listener = tokio::net::TcpListener::bind(&bind).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

fn router(data_dir: PathBuf) -> Router {
    Router::new()
        .route("/search/name", get(search_name))
        .route("/search/name/", get(search_name))
        .route("/search/pzn", get(search_pzn))
        .route("/search/pzn/", get(search_pzn))
        .with_state(AppState { data_dir: Arc::new(data_dir) })
}

async fn search_name(
    State(state): State<AppState>,
    Query(query): Query<NameQuery>,
) -> Result<Json<NameSearch>, StatusCode> {
    let dataset = load_dataset(&state.data_dir).map_err(status_for_load)?;
    Ok(Json(search_by_name(&dataset, &query.q, query.page)))
}

async fn search_pzn(
    State(state): State<AppState>,
    Query(query): Query<PznQuery>,
) -> Result<Json<PznSearch>, StatusCode> {
    let dataset = load_dataset(&state.data_dir).map_err(status_for_load)?;
    Ok(Json(search_by_pzn(&dataset, &query.pzn)))
}

fn status_for_load(error: LoadError) -> StatusCode {
    let _ = error;
    StatusCode::INTERNAL_SERVER_ERROR
}
