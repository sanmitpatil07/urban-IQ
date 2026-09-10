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

## Data Sources
- **Landsat 8/9** (USGS via Microsoft Planetary Computer) — Surface Temperature
- **Sentinel-2 L2A** (ESA via Microsoft Planetary Computer) — NDVI/NDBI bands
- **OpenStreetMap** — City administrative boundaries

## License
MIT
