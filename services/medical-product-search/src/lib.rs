use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::BufReader;
use std::path::{Component, Path, PathBuf};

use nucleo_matcher::pattern::{CaseMatching, Normalization, Pattern};
use nucleo_matcher::{Config, Matcher, Utf32Str};
use serde::Deserialize;
use serde::Serialize;

pub const PAGE_SIZE: usize = 20;

const MEDICINAL_HEADER: &str = "RMP_KEY";
const PHARMACEUTICAL_HEADER: &str = "RPP_KEY";
const SUBSTANCE_HEADER: &str = "RSE_KEY";

#[derive(Debug)]
pub enum LoadError {
    Io(std::io::Error),
    Metadata(String),
    Csv(csv::Error),
}

impl From<std::io::Error> for LoadError {
    fn from(error: std::io::Error) -> Self {
        Self::Io(error)
    }
}

impl From<csv::Error> for LoadError {
    fn from(error: csv::Error) -> Self {
        Self::Csv(error)
    }
}

impl From<serde_json::Error> for LoadError {
    fn from(error: serde_json::Error) -> Self {
        Self::Metadata(error.to_string())
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Product {
    pub id: String,
    pub pzn: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub name: String,
    pub ingredient: String,
}

#[derive(Debug, Clone)]
pub struct Dataset {
    pub date: String,
    pub source: String,
    pub products: Vec<Product>,
}

#[derive(Debug, Clone, Serialize)]
pub struct NameSearch {
    pub date: String,
    pub source: String,
    pub page: u32,
    #[serde(rename = "pageSize")]
    pub page_size: usize,
    #[serde(rename = "hasMore")]
    pub has_more: bool,
    pub results: Vec<Product>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PznSearch {
    pub date: String,
    pub source: String,
    #[serde(rename = "hasResult")]
    pub has_result: bool,
    pub results: Option<Product>,
}

#[derive(Debug, Deserialize)]
struct MetadataFile {
    date: String,
    #[serde(rename = "sourceUrl")]
    source_url: String,
    #[serde(rename = "medicalProducts")]
    medical_products: String,
    #[serde(rename = "pharmaceuticalProduct")]
    pharmaceutical_product: String,
    substance: String,
}

pub fn load_dataset(data_dir: &Path) -> Result<Dataset, LoadError> {
    let metadata_path = data_dir.join("metadata.json");
    let metadata: MetadataFile = serde_json::from_reader(BufReader::new(File::open(metadata_path)?))?;
    let medical_path = resolve_data_path(data_dir, &metadata.medical_products)?;
    let pharmaceutical_path = resolve_data_path(data_dir, &metadata.pharmaceutical_product)?;
    let substance_path = resolve_data_path(data_dir, &metadata.substance)?;

    let substances = read_substances(&substance_path)?;
    let pharmaceutical_products = read_pharmaceutical_products(&pharmaceutical_path)?;
    let products = read_medical_products(&medical_path, &pharmaceutical_products, &substances)?;

    Ok(Dataset {
        date: metadata.date,
        source: metadata.source_url,
        products,
    })
}

pub fn search_by_name(dataset: &Dataset, query: &str, page: u32) -> NameSearch {
    let page = page.max(1);
    let matches = rank_matches(&dataset.products, query);
    let start = (page as usize - 1).saturating_mul(PAGE_SIZE);
    let results = matches
        .iter()
        .skip(start)
        .take(PAGE_SIZE)
        .map(|product| (*product).clone())
        .collect::<Vec<_>>();
    let has_more = start.saturating_add(PAGE_SIZE) < matches.len();
    NameSearch {
        date: dataset.date.clone(),
        source: dataset.source.clone(),
        page,
        page_size: PAGE_SIZE,
        has_more,
        results,
    }
}

pub fn search_by_pzn(dataset: &Dataset, pzn: &str) -> PznSearch {
    let needle = pzn.trim();
    let product = dataset.products.iter().find(|product| product.pzn == needle).cloned();
    PznSearch {
        date: dataset.date.clone(),
        source: dataset.source.clone(),
        has_result: product.is_some(),
        results: product,
    }
}

fn resolve_data_path(data_dir: &Path, relative: &str) -> Result<PathBuf, LoadError> {
    let relative_path = Path::new(relative);
    let leaves_directory = relative.is_empty()
        || relative_path.is_absolute()
        || relative_path.components().any(|component| component == Component::ParentDir);
    if leaves_directory {
        return Err(LoadError::Metadata(format!("invalid data path: {relative}")));
    }
    Ok(data_dir.join(relative_path))
}

fn read_rows(path: &Path) -> Result<Vec<Vec<String>>, LoadError> {
    let mut reader = csv::ReaderBuilder::new()
        .delimiter(b'|')
        .has_headers(false)
        .flexible(true)
        .from_reader(BufReader::new(File::open(path)?));
    let mut rows = Vec::new();
    for record in reader.records() {
        let record = record?;
        rows.push(record.iter().map(str::to_owned).collect());
    }
    Ok(rows)
}

fn skip_header<'a>(rows: &'a [Vec<String>], header: &str) -> &'a [Vec<String>] {
    match rows.first() {
        Some(row) if row.first().is_some_and(|field| field == header) => &rows[1..],
        _ => rows,
    }
}

fn field(row: &[String], index: usize) -> String {
    row.get(index).cloned().unwrap_or_default()
}

fn read_substances(path: &Path) -> Result<HashMap<String, Vec<(i64, String)>>, LoadError> {
    let rows = read_rows(path)?;
    let mut substances: HashMap<String, Vec<(i64, String)>> = HashMap::new();
    for row in skip_header(&rows, SUBSTANCE_HEADER) {
        let pharmaceutical_key = field(row, 1);
        if pharmaceutical_key.is_empty() {
            continue;
        }
        let rank = field(row, 5).parse::<i64>().unwrap_or(i64::MAX);
        substances.entry(pharmaceutical_key).or_default().push((rank, field(row, 2)));
    }
    Ok(substances)
}

fn read_pharmaceutical_products(path: &Path) -> Result<HashMap<String, Vec<String>>, LoadError> {
    let rows = read_rows(path)?;
    let mut products: HashMap<String, Vec<String>> = HashMap::new();
    for row in skip_header(&rows, PHARMACEUTICAL_HEADER) {
        let medical_key = field(row, 1);
        let pharmaceutical_key = field(row, 0);
        if medical_key.is_empty() || pharmaceutical_key.is_empty() {
            continue;
        }
        products.entry(medical_key).or_default().push(pharmaceutical_key);
    }
    Ok(products)
}

fn read_medical_products(
    path: &Path,
    pharmaceutical_products: &HashMap<String, Vec<String>>,
    substances: &HashMap<String, Vec<(i64, String)>>,
) -> Result<Vec<Product>, LoadError> {
    let rows = read_rows(path)?;
    let mut products = Vec::new();
    for row in skip_header(&rows, MEDICINAL_HEADER) {
        let id = field(row, 0);
        if id.is_empty() {
            continue;
        }
        products.push(Product {
            id: id.clone(),
            pzn: field(row, 1),
            kind: field(row, 5),
            name: field(row, 8),
            ingredient: ingredient_for(&id, pharmaceutical_products, substances),
        });
    }
    Ok(products)
}

fn ingredient_for(
    medical_key: &str,
    pharmaceutical_products: &HashMap<String, Vec<String>>,
    substances: &HashMap<String, Vec<(i64, String)>>,
) -> String {
    let mut ranked = Vec::new();
    for pharmaceutical_key in pharmaceutical_products.get(medical_key).into_iter().flatten() {
        for substance in substances.get(pharmaceutical_key).into_iter().flatten() {
            ranked.push(substance.clone());
        }
    }
    ranked.sort_by_key(|substance| substance.0);
    let mut seen = HashSet::new();
    let mut names = Vec::new();
    for (_, name) in ranked {
        let trimmed = name.trim();
        if trimmed.is_empty() || !seen.insert(trimmed.to_owned()) {
            continue;
        }
        names.push(trimmed.to_owned());
    }
    names.join(", ")
}

fn rank_matches<'a>(products: &'a [Product], query: &str) -> Vec<&'a Product> {
    let folded_query = query.trim().to_lowercase();
    if folded_query.is_empty() {
        return Vec::new();
    }
    let tokens: Vec<&str> = folded_query.split_whitespace().filter(|token| !token.is_empty()).collect();
    let mut matcher = Matcher::new(Config::DEFAULT);
    let pattern = Pattern::parse(&folded_query, CaseMatching::Ignore, Normalization::Smart);
    let mut scored = Vec::new();
    for product in products {
        let folded_name = product.name.to_lowercase();
        if !tokens.iter().all(|token| folded_name.contains(token)) {
            continue;
        }
        let mut buffer = Vec::new();
        let haystack = Utf32Str::new(&product.name, &mut buffer);
        let score = pattern.score(haystack, &mut matcher).unwrap_or(0);
        scored.push((score, product));
    }
    scored.sort_by(|left, right| {
        right.0.cmp(&left.0)
            .then_with(|| left.1.name.to_lowercase().cmp(&right.1.name.to_lowercase()))
            .then_with(|| left.1.id.cmp(&right.1.id))
    });
    scored.into_iter().map(|(_, product)| product).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    struct TempDir(PathBuf);

    impl TempDir {
        fn new() -> Self {
            let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos();
            let path = std::env::temp_dir().join(format!("medical-product-search-{nanos}"));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn write_fixture(dir: &Path) {
        fs::write(
            dir.join("metadata.json"),
            r#"{
              "date": "2026-10-15T00:00:00.000Z",
              "sourceUrl": "https://portal.bfarm.de/amguifree",
              "medicalProducts": "20261015-REFERENCE_MEDICINAL_PRODUCT.dsv",
              "pharmaceuticalProduct": "20261015-REFERENCE_PHARMACEUTICAL_PRODUCT.dsv",
              "substance": "20261015-REFERENCE_SUBSTANCE.dsv"
            }"#,
        ).unwrap();
        fs::write(
            dir.join("20261015-REFERENCE_MEDICINAL_PRODUCT.dsv"),
            "RMP_KEY|RMP_PZN|RMP_COUNT_SUBSTANCE|RMP_MULTIPLE_PPT|RMP_PFM_PUT_SHORT|RMP_PFM_PUT_LONG|RMP_PFM_NAME|RMP_PFM_TERM_ID|RMP_MPD_NAME\n\
             1|12345678|2|0|TAB|Tabletten|Tab|1|Ibuprofen AL 400\n\
             2|87654321|1|0|TAB|Tabletten|Tab|1|Paracetamol 500\n",
        ).unwrap();
        fs::write(
            dir.join("20261015-REFERENCE_PHARMACEUTICAL_PRODUCT.dsv"),
            "RPP_KEY|RMP_KEY|RPP_NUMBER|RPP_PFM_PUT_SHORT|RPP_PFM_PUT_LONG|RPP_PFM_NAME|RPP_PFM_TERM_ID|RPP_DESCRIPTION\n\
             10|1|1|TAB|Tabletten|Tab|1|Ibuprofen\n\
             11|2|1|TAB|Tabletten|Tab|1|Paracetamol\n",
        ).unwrap();
        fs::write(
            dir.join("20261015-REFERENCE_SUBSTANCE.dsv"),
            "RSE_KEY|RPP_KEY|RSE_SUBSTANCE_NAME|RSE_SUBSTANCE_STRENGTH|RSE_SUBSTANCE_ID|RSE_SUBSTANCE_RANK\n\
             100|10|Ibuprofen|400|ib|2\n\
             101|10|Macrogol|1|mg|1\n\
             102|11|Paracetamol|500|pa|1\n",
        ).unwrap();
    }

    #[test]
    fn loads_joins_and_searches() {
        let dir = TempDir::new();
        write_fixture(&dir.0);
        let dataset = load_dataset(&dir.0).unwrap();
        assert_eq!(dataset.products.len(), 2);
        let ibuprofen = dataset.products.iter().find(|product| product.id == "1").unwrap();
        assert_eq!(ibuprofen.ingredient, "Macrogol, Ibuprofen");
        assert_eq!(ibuprofen.kind, "Tabletten");

        let by_name = search_by_name(&dataset, "ibu", 1);
        assert_eq!(by_name.date, "2026-10-15T00:00:00.000Z");
        assert_eq!(by_name.source, "https://portal.bfarm.de/amguifree");
        assert_eq!(by_name.results.len(), 1);
        assert_eq!(by_name.results[0].pzn, "12345678");

        let empty = search_by_name(&dataset, "   ", 1);
        assert!(empty.results.is_empty());
        assert_eq!(empty.source, dataset.source);

        let by_pzn = search_by_pzn(&dataset, "87654321");
        assert!(by_pzn.has_result);
        assert_eq!(by_pzn.results.unwrap().name, "Paracetamol 500");

        let missing = search_by_pzn(&dataset, "000");
        assert!(!missing.has_result);
        assert!(missing.results.is_none());
        assert_eq!(missing.date, dataset.date);
    }

    #[test]
    fn paginates_name_search() {
        let dir = TempDir::new();
        let mut lines = String::from("RMP_KEY|RMP_PZN|RMP_COUNT_SUBSTANCE|RMP_MULTIPLE_PPT|RMP_PFM_PUT_SHORT|RMP_PFM_PUT_LONG|RMP_PFM_NAME|RMP_PFM_TERM_ID|RMP_MPD_NAME\n");
        for index in 1..=25 {
            lines.push_str(&format!("{index}|{index:08}|0|0|TAB|Tabletten|Tab|1|Aspirin {index}\n"));
        }
        fs::write(dir.0.join("metadata.json"), r#"{"date":"2026-10-15T00:00:00.000Z","sourceUrl":"https://portal.bfarm.de/amguifree","medicalProducts":"products.dsv","pharmaceuticalProduct":"pharma.dsv","substance":"substances.dsv"}"#).unwrap();
        fs::write(dir.0.join("products.dsv"), lines).unwrap();
        fs::write(dir.0.join("pharma.dsv"), "RPP_KEY|RMP_KEY|RPP_NUMBER|RPP_PFM_PUT_SHORT|RPP_PFM_PUT_LONG|RPP_PFM_NAME|RPP_PFM_TERM_ID|RPP_DESCRIPTION\n").unwrap();
        fs::write(dir.0.join("substances.dsv"), "RSE_KEY|RPP_KEY|RSE_SUBSTANCE_NAME|RSE_SUBSTANCE_STRENGTH|RSE_SUBSTANCE_ID|RSE_SUBSTANCE_RANK\n").unwrap();
        let dataset = load_dataset(&dir.0).unwrap();
        let first = search_by_name(&dataset, "aspirin", 1);
        let second = search_by_name(&dataset, "aspirin", 2);
        assert_eq!(first.results.len(), 20);
        assert!(first.has_more);
        assert_eq!(second.results.len(), 5);
        assert!(!second.has_more);
    }
}
