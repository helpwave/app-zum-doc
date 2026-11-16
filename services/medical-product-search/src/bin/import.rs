use std::path::PathBuf;

use medical_product_search::db;

#[tokio::main]
async fn main() {
    let database_url = match std::env::var("DATABASE_URL") {
        Ok(value) if !value.trim().is_empty() => value,
        _ => {
            eprintln!("DATABASE_URL is required");
            std::process::exit(1);
        }
    };
    let data_dir = PathBuf::from(std::env::var("DATA_DIR").unwrap_or_else(|_| "./data".to_owned()));
    match db::import_dataset(&database_url, &data_dir).await {
        Ok(count) => {
            println!("imported {count} products");
        }
        Err(error) => {
            eprintln!("import failed: {error}");
            std::process::exit(1);
        }
    }
}
