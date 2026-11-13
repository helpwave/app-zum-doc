# Medical product search

Search service for the BfArM reference files. Every request reads `metadata.json` and the three `.dsv` files it names. Nothing is kept in memory between requests.

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

`date` is an ISO-8601 string. `sourceUrl` is returned as `source` on every response. The files are pipe-separated. A header row is skipped when the first column is `RMP_KEY`, `RPP_KEY`, or `RSE_KEY`.

Replace the files on disk to publish a newer dataset. The next request reads the new `metadata.json`.

## Start

From this directory, with the data folder above as `./data`:

```bash
cargo run
```

`DATA_DIR` defaults to `./data`. `BIND` defaults to `0.0.0.0:8080`.

```bash
DATA_DIR=/absolute/path/to/data BIND=127.0.0.1:8080 cargo run
```

From the Nix dev shell at the repository root:

```bash
nix develop
cd services/medical-product-search
DATA_DIR="$PWD/data" cargo run
```

The Nix package is `medical-product-search`:

```bash
nix build .#medical-product-search
DATA_DIR=/absolute/path/to/data ./result/bin/medical-product-search
```

Docker, with the data directory mounted at `/data`:

```bash
docker build -t medical-product-search services/medical-product-search
docker run --rm -p 8080:8080 -v /absolute/path/to/data:/data medical-product-search
```

## Test

Unit tests use temporary files and do not need the real dataset:

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
