# Urban Heat Decision Support System

**Evidence-based heat mitigation for Indian cities.**

An interactive decision support tool that helps municipal urban planners visualize urban heat islands and simulate the impact of interventions (tree cover, cool roofs) on surface temperatures — backed by real satellite data and machine learning.

## Quick Start

### Prerequisites
- [uv](https://docs.astral.sh/uv/) (Python package manager)

### Setup
```bash
cd urban-heat-dss

# Create virtual environment with Python 3.12 (uv downloads it automatically)
uv venv --python 3.12

# Activate it
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"
```

### Run Data Acquisition (Milestone 1)
```bash
# Search for available scenes (no download)
python scripts/run_acquire.py --city pune --skip-download

# Full acquisition: boundary + satellite data
python scripts/run_acquire.py --city pune
```

## Project Structure
```
urban-heat-dss/
├── config/cities/          # City-specific YAML configs
├── data/                   # Git-ignored — satellite data
│   └── {city}/
│       ├── boundary/       # City boundary GeoJSON
│       ├── raw/            # Clipped satellite bands
│       │   ├── landsat/
│       │   └── sentinel2/
│       └── processed/      # Zone-level outputs
├── src/urban_heat/         # Core pipeline code
│   ├── config.py           # Config loading & validation
│   ├── boundary.py         # City boundary from OSM
│   ├── acquire.py          # STAC search & download
│   └── utils.py            # Logging, paths, helpers
├── scripts/                # CLI entry points
└── tests/                  # Unit tests
```

## Adding a New City
1. Create `config/cities/{city_name}.yaml` (see `pune.yaml` for reference)
2. Run `python scripts/run_acquire.py --city {city_name}`

## Production deployment

Deploy the API and web application as separate services. The frontend is a
static Vite build; the API is the included Docker image. Processed GeoJSON and
model artifacts are deliberately excluded from Git and must be supplied to the
API as a read-only release volume (or synced to the directory named by
`URBAN_HEAT_DATA_DIR`).

1. Build a data release containing `data/<city>/processed/<city>_zones.geojson`
   and `data/<city>/processed/model/<city>_rf_model.joblib` (or a supported
   PINN artifact).
2. Deploy the API using `Dockerfile`, mount that release at `/app/data`, and
   set the values in `.env.production.example`. Configure the platform health
   check as `GET /ready`; it returns 503 until both data and a model are present.
3. Deploy `frontend` to a static host. Copy
   `frontend/.env.production.example` into the host's build-time environment,
   substituting the public HTTPS API URL. `VITE_API_BASE_URL` is required for a
   production build and `VITE_ENABLE_DEMO_MODE` must remain `false`.
4. Set `ALLOWED_ORIGINS` to the exact frontend origin. A production API refuses
   to start without it. Put rate limiting/WAF in front of a public API. If the
   API is private, set `URBAN_HEAT_API_KEY` and have an authenticated gateway
   inject it; browser bundles must never contain that secret.

Verify the release after deployment:

```text
GET https://api.example.com/health  -> 200
GET https://api.example.com/ready   -> 200 with the deployed city list
GET https://api.example.com/heatmap/pune -> 200
```

## Data Sources
- **Landsat 8/9** (USGS via Microsoft Planetary Computer) — Surface Temperature
- **Sentinel-2 L2A** (ESA via Microsoft Planetary Computer) — NDVI/NDBI bands
- **OpenStreetMap** — City administrative boundaries

## License
MIT
