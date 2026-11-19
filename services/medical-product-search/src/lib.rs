use nucleo_matcher::pattern::{CaseMatching, Normalization, Pattern};
use nucleo_matcher::{Config, Matcher, Utf32Str};
use serde::Serialize;
use std::collections::HashSet;

pub mod db;

pub const PAGE_SIZE: usize = 20;

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct Substance {
    pub id: String,
    pub name: String,
    pub strength: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Product {
    pub id: String,
    pub pzn: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub name: String,
    pub ingredient: Vec<Substance>,
    #[serde(rename = "packageSize", skip_serializing_if = "Option::is_none")]
    pub package_size: Option<String>,
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

pub fn search_by_name(dataset: &Dataset, query: &str, page: u32) -> NameSearch {
    let page = page.max(1);
    let matches = dedupe_by_name(rank_matches(&dataset.products, query));
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
    let product = dataset
        .products
        .iter()
        .find(|product| product.pzn == needle)
        .cloned();
    PznSearch {
        date: dataset.date.clone(),
        source: dataset.source.clone(),
        has_result: product.is_some(),
        results: product,
    }
}

fn rank_matches<'a>(products: &'a [Product], query: &str) -> Vec<&'a Product> {
    let folded_query = query.trim().to_lowercase();
    if folded_query.is_empty() {
        return Vec::new();
    }
    let tokens: Vec<&str> = folded_query
        .split_whitespace()
        .filter(|token| !token.is_empty())
        .collect();
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
        right
            .0
            .cmp(&left.0)
            .then_with(|| left.1.name.to_lowercase().cmp(&right.1.name.to_lowercase()))
            .then_with(|| left.1.id.cmp(&right.1.id))
    });
    scored.into_iter().map(|(_, product)| product).collect()
}

fn dedupe_by_name<'a>(matches: Vec<&'a Product>) -> Vec<&'a Product> {
    let mut seen = HashSet::new();
    let mut unique = Vec::new();
    for product in matches {
        if seen.insert(product.name.to_lowercase()) {
            unique.push(product);
        }
    }
    unique
}

#[cfg(test)]
mod tests {
    use super::{search_by_name, Dataset, Product, Substance};

    fn product(id: &str, pzn: &str, name: &str) -> Product {
        Product {
            id: id.to_owned(),
            pzn: pzn.to_owned(),
            kind: "Tabletten".to_owned(),
            name: name.to_owned(),
            ingredient: vec![Substance {
                id: format!("{id}-substance"),
                name: name.to_owned(),
                strength: "10 mg".to_owned(),
            }],
            package_size: None,
        }
    }

    #[test]
    fn collapses_matches_by_product_name_before_paging() {
        let dataset = Dataset {
            date: String::new(),
            source: String::new(),
            products: vec![
                product("a", "11111111", "Ibuprofen AL 400"),
                product("b", "22222222", "Ibuprofen AL 400"),
                product("c", "33333333", "Paracetamol 500"),
            ],
        };
        let page = search_by_name(&dataset, "Ibuprofen", 1);
        assert_eq!(page.results.len(), 1);
        assert_eq!(page.results[0].pzn, "11111111");
        assert!(page.results[0].package_size.is_none());
        assert_eq!(page.results[0].ingredient.len(), 1);
    }
}
