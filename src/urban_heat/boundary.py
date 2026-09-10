"""
City boundary acquisition from OpenStreetMap Overpass API.

Fetches the administrative boundary for a city using its OSM relation ID,
converts it to a GeoJSON polygon, and saves it locally.
"""

import json

import geopandas as gpd
import requests
from shapely.geometry import MultiPolygon, Polygon, shape
from shapely.ops import unary_union

from urban_heat.config import CityConfig
from urban_heat.utils import boundary_path, log


# ---------------------------------------------------------------------------
# Overpass API
# ---------------------------------------------------------------------------

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OVERPASS_QUERY_TEMPLATE = """
[out:json][timeout:120];
relation({relation_id});
out geom;
"""


def _build_polygon_from_relation(relation: dict) -> Polygon | MultiPolygon:
    """
    Build a polygon from an Overpass relation response.

    Overpass returns relation members as ways with node coordinates.
    We assemble outer ways into a polygon (or multipolygon for complex boundaries).
    """
    outer_ways = []
    inner_ways = []

    for member in relation.get("members", []):
        if member.get("type") != "way":
            continue

        coords = []
        if "geometry" in member:
            coords = [(node["lon"], node["lat"]) for node in member["geometry"]]

        role = member.get("role", "outer")
        if role == "outer" and len(coords) >= 4:
            outer_ways.append(coords)
        elif role == "inner" and len(coords) >= 4:
            inner_ways.append(coords)

    if not outer_ways:
        raise ValueError("No outer ways found in the relation — cannot build boundary polygon")

    # Merge connected ways into closed rings
    merged_outers = _merge_ways(outer_ways)
    merged_inners = _merge_ways(inner_ways) if inner_ways else []

    # Build polygons
    polygons = []
    for outer_ring in merged_outers:
        # Find inner rings that fall within this outer ring
        outer_poly = Polygon(outer_ring)
        holes = [inner for inner in merged_inners if outer_poly.contains(Polygon(inner))]
        polygons.append(Polygon(outer_ring, holes))

    if len(polygons) == 1:
        return polygons[0]
    return MultiPolygon(polygons)


def _merge_ways(ways: list[list[tuple]]) -> list[list[tuple]]:
    """
    Merge connected ways into closed rings.

    OSM ways that form a boundary are often split into segments.
    This function chains them end-to-end based on matching endpoints.
    """
    if not ways:
        return []

    # Already closed rings
    closed = [w for w in ways if w[0] == w[-1] and len(w) >= 4]
    open_ways = [list(w) for w in ways if w[0] != w[-1]]

    if not open_ways:
        return closed

    # Greedily chain open ways
    chains: list[list[tuple]] = [open_ways.pop(0)]

    max_iterations = len(open_ways) * len(open_ways) + 1
    iteration = 0

    while open_ways and iteration < max_iterations:
        iteration += 1
        merged = False
        for i, way in enumerate(open_ways):
            current_chain = chains[-1]

            # Try connecting end-to-start
            if current_chain[-1] == way[0]:
                current_chain.extend(way[1:])
                open_ways.pop(i)
                merged = True
                break
            # Try connecting end-to-end (reverse way)
            elif current_chain[-1] == way[-1]:
                current_chain.extend(reversed(way[:-1]))
                open_ways.pop(i)
                merged = True
                break
            # Try connecting start-to-end
            elif current_chain[0] == way[-1]:
                chains[-1] = way[:-1] + current_chain
                open_ways.pop(i)
                merged = True
                break
            # Try connecting start-to-start (reverse way)
            elif current_chain[0] == way[0]:
                chains[-1] = list(reversed(way[1:])) + current_chain
                open_ways.pop(i)
                merged = True
                break

        if not merged:
            # Start a new chain
            if open_ways:
                chains.append(open_ways.pop(0))

    # Check which chains are closed
    result = closed
    for chain in chains:
        if len(chain) >= 4:
            if chain[0] != chain[-1]:
                chain.append(chain[0])  # Force close
            result.append(chain)

    return result


def fetch_boundary_from_osm(config: CityConfig) -> gpd.GeoDataFrame:
    """
    Fetch city boundary from OpenStreetMap Overpass API.

    Parameters
    ----------
    config : CityConfig
        City configuration with osm_relation_id.

    Returns
    -------
    gpd.GeoDataFrame
        Single-row GeoDataFrame with the city boundary polygon.
    """
    log.info("Fetching boundary for '%s' (OSM relation %d)...", config.city_name, config.osm_relation_id)

    query = OVERPASS_QUERY_TEMPLATE.format(relation_id=config.osm_relation_id)

    response = requests.post(
        OVERPASS_URL,
        data={"data": query},
        timeout=180,
        headers={"User-Agent": "UrbanHeatDSS/0.1 (research)"},
    )
    response.raise_for_status()
    data = response.json()

    elements = data.get("elements", [])
    relations = [e for e in elements if e.get("type") == "relation"]

    if not relations:
        raise ValueError(
            f"No relation found for ID {config.osm_relation_id}. "
            "Check the ID at https://www.openstreetmap.org/relation/{id}"
        )

    relation = relations[0]
    polygon = _build_polygon_from_relation(relation)

    if not polygon.is_valid:
        log.warning("Boundary polygon is invalid — attempting to fix with buffer(0)")
        polygon = polygon.buffer(0)

    # Build GeoDataFrame
    gdf = gpd.GeoDataFrame(
        {
            "city_name": [config.city_name],
            "osm_relation_id": [config.osm_relation_id],
            "area_km2": [None],  # Filled after reprojection
        },
        geometry=[polygon],
        crs="EPSG:4326",
    )

    # Reproject to target CRS and compute area
    gdf_proj = gdf.to_crs(config.target_crs)
    gdf["area_km2"] = gdf_proj.geometry.area / 1e6  # m² → km²

    area = gdf["area_km2"].iloc[0]
    log.info("Boundary fetched: %.1f km² | CRS: EPSG:4326", area)

    return gdf


def save_boundary(gdf: gpd.GeoDataFrame, config: CityConfig) -> str:
    """Save boundary GeoDataFrame to disk as GeoJSON. Returns file path."""
    out_path = boundary_path(config.city_name)
    gdf.to_file(out_path, driver="GeoJSON")
    log.info("Boundary saved to %s", out_path)
    return str(out_path)


def load_boundary(config: CityConfig) -> gpd.GeoDataFrame:
    """Load existing boundary from disk."""
    path = boundary_path(config.city_name)
    if not path.exists():
        raise FileNotFoundError(f"Boundary not found: {path}. Run boundary acquisition first.")
    gdf = gpd.read_file(path)
    log.info("Loaded boundary from %s (%.1f km²)", path, gdf["area_km2"].iloc[0])
    return gdf


def get_or_fetch_boundary(config: CityConfig) -> gpd.GeoDataFrame:
    """Load boundary from disk if it exists, otherwise fetch from OSM."""
    path = boundary_path(config.city_name)
    if path.exists():
        log.info("Boundary already exists at %s — loading from disk", path)
        return load_boundary(config)

    gdf = fetch_boundary_from_osm(config)
    save_boundary(gdf, config)
    return gdf
