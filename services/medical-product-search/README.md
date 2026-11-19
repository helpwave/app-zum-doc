# Medical product search

Search service for the BfArM reference files. The server reads the catalog from Postgres. On startup the container runs an import that reads `metadata.json` and the three `.dsv` files it names, then the server starts and answers requests from the database.

## Where to put the files

Create a data directory and put `metadata.json` in it. Put the `.dsv` files next to it, or in a subdirectory of that same folder. The paths in `metadata.json` are relative to the data directory, include the file extension, and must not be absolute or contain `..`.

```text
data/
  metadata.json
  20261015-REFERENCE_MEDICINAL_PRODUCT.dsv
  20261015-REFERENCE_PHARMACEUTICAL_PRODUCT.dsv
  20261015-REFERENCE_SUBSTANCE.dsv
```

`metadata.json`:

```json
{
  "date": "2026-10-15T00:00:00.000Z",
  "sourceUrl": "https://portal.bfarm.de/amguifree",
  "medicalProducts": "20261015-REFERENCE_MEDICINAL_PRODUCT.dsv",
  "pharmaceuticalProduct": "20261015-REFERENCE_PHARMACEUTICAL_PRODUCT.dsv",
  "substance": "20261015-REFERENCE_SUBSTANCE.dsv"
}
```

`date` is an ISO-8601 string. `sourceUrl` is stored as `source` and returned on every response. The files are pipe-separated. A header row is skipped when the first column is `RMP_KEY`, `RPP_KEY`, or `RSE_KEY`.

The import joins those files into `dataset` (one row: `date`, `source`) and `products` (`id`, `pzn`, `kind`, `name`, `ingredient`). Replace the files and start the container again to publish a newer dataset. Each start loads the files again.

## Start

From the repository root, with the data directory at `services/medical-product-search/data`:

```bash
docker compose up --build
```

That uses [`docker-compose.yml`](../../docker-compose.yml). It builds the image from the Dockerfile in this directory and starts Postgres 16 with the search container. The container entrypoint runs `medical-product-search-import`, then the server. `DATABASE_URL` points at the `postgres` service. `DATA_DIR` is `/data`. The API listens on port `8080`.

Publish Postgres on the host as well:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yaml up --build
```

Run the image published to `ghcr.io/helpwave/app-zum-doc/medical-product-search`:

```bash
docker compose -f docker-compose.prod.yaml up
```

The Compose database credentials are for local use: user, password, and database name are all `medical_product_search`. With the base file, Postgres stays on the Compose network at `postgres:5432`. The dev file publishes it on port `5432`.

To run the binaries yourself, start Postgres with that port published. `DATA_DIR` defaults to `./data`. `BIND` defaults to `0.0.0.0:8080`.

```bash
cd services/medical-product-search
export DATABASE_URL=postgres://medical_product_search:medical_product_search@127.0.0.1:5432/medical_product_search
DATA_DIR=./data cargo run --bin medical-product-search-import
BIND=127.0.0.1:8080 cargo run --bin medical-product-search
```

From the Nix dev shell at the repository root:

```bash
nix develop
cd services/medical-product-search
export DATABASE_URL=postgres://medical_product_search:medical_product_search@127.0.0.1:5432/medical_product_search
DATA_DIR="$PWD/data" cargo run --bin medical-product-search-import
cargo run --bin medical-product-search
```

The Nix package is `medical-product-search` and includes the import binary:

```bash
nix build .#medical-product-search
export DATABASE_URL=postgres://medical_product_search:medical_product_search@127.0.0.1:5432/medical_product_search
DATA_DIR=/absolute/path/to/data ./result/bin/medical-product-search-import
./result/bin/medical-product-search
```

## Test

Unit tests use temporary files and do not need Postgres:

```bash
cargo test
```

With the server running:

```bash
curl 'http://127.0.0.1:8080/search/name/?q=ibuprofen&page=1'
curl 'http://127.0.0.1:8080/search/pzn/?pzn=12345678'
```

Name search returns 20 matches per page. `hasMore` is true when another page exists. PZN search is an exact match and returns `hasResult: false` with `results: null` when the PZN is missing.

## Mobile app

Point the app at the server:

```bash
EXPO_PUBLIC_MEDICAL_PRODUCT_SEARCH_URL=http://127.0.0.1:8080 pnpm --filter @app-zum-doc/mobile start
```

On a device or emulator, use the computer's LAN address instead of `127.0.0.1`. The medication search calls `/search/name/`. The camera button reads a barcode and calls `/search/pzn/`. Without this variable, the app keeps using the local medication catalog.
