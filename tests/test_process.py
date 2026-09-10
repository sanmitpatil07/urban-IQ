import tempfile
from pathlib import Path
import numpy as np
import pytest
import rasterio
from rasterio.transform import from_origin
import geopandas as gpd
from shapely.geometry import Polygon, box

from urban_heat.process import compute_ndvi, create_grid


def test_compute_ndvi_safe_division():
    """
    Test compute_ndvi handles division by zero and nodata safely without crashing,
    returning NaN for invalid/zero denominator pixels.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        b04_path = Path(tmpdir) / "B04.tif"
        b08_path = Path(tmpdir) / "B08.tif"

        # 2x2 raster with test cases:
        # [0, 0]: Normal vegetation (Red=1000, NIR=3000) -> NDVI = 0.5
        # [0, 1]: Zero division / nodata (Red=0, NIR=0) -> denominator = 0 -> NaN
        # [1, 0]: Opposing zero denominator (Red=500, NIR=-500) -> denominator = 0 -> NaN
        # [1, 1]: Sparse vegetation (Red=2000, NIR=3000) -> NDVI = 0.2
        red_data = np.array([[1000.0, 0.0], [500.0, 2000.0]], dtype=np.float32)
        nir_data = np.array([[3000.0, 0.0], [-500.0, 3000.0]], dtype=np.float32)

        transform = from_origin(73.8, 18.6, 10, 10)
        crs = "EPSG:4326"

        for pth, data in [(b04_path, red_data), (b08_path, nir_data)]:
            with rasterio.open(
                pth,
                "w",
                driver="GTiff",
                height=2,
                width=2,
                count=1,
                dtype=np.float32,
                crs=crs,
                transform=transform,
            ) as dst:
                dst.write(data, 1)

        ndvi, meta = compute_ndvi(b04_path, b08_path)

        # Pixel [0, 0]: (3000 - 1000) / (3000 + 1000) = 0.5
        assert np.isclose(ndvi[0, 0], 0.5)

        # Pixel [0, 1]: Zero denominator (0 / 0) must be NaN
        assert np.isnan(ndvi[0, 1])

        # Pixel [1, 0]: Opposing zero denominator (-500 + 500 = 0) must be NaN
        assert np.isnan(ndvi[1, 0])

        # Pixel [1, 1]: (3000 - 2000) / (3000 + 2000) = 0.2
        assert np.isclose(ndvi[1, 1], 0.2)


def test_create_grid_boundary_clipping():
    """
    Test create_grid clips cells strictly to city boundary geometry,
    ensuring no cells extend outside the boundary and area is preserved.
    """
    # Create an L-shaped polygonal boundary in UTM coordinates (meters)
    # Target CRS: WGS 84 / UTM zone 43N (EPSG:32643)
    coords = [
        (300000.0, 2000000.0),
        (302000.0, 2000000.0),
        (302000.0, 2001000.0),
        (301000.0, 2001000.0),
        (301000.0, 2002000.0),
        (300000.0, 2002000.0),
        (300000.0, 2000000.0),
    ]
    poly = Polygon(coords)
    boundary_gdf = gpd.GeoDataFrame(geometry=[poly], crs="EPSG:32643")
    expected_area_m2 = poly.area

    # Generate 500m resolution grid
    grid = create_grid(boundary_gdf, resolution=500, target_crs="EPSG:32643")

    # Assert grid is non-empty
    assert len(grid) > 0
    assert "zone_id" in grid.columns
    assert "area_m2" in grid.columns

    # 1. Ensure no grid cell is empty
    assert not grid.geometry.is_empty.any()

    # 2. Ensure every grid cell strictly lies within the boundary
    boundary_union = boundary_gdf.geometry.union_all()
    for geom in grid.geometry:
        # Difference between cell geometry and boundary must have near-zero area
        diff_area = geom.difference(boundary_union).area
        assert diff_area < 1e-3, f"Grid cell extends outside boundary by {diff_area} m²"

    # 3. Ensure total grid area matches original polygon area (within precision tolerance)
    total_grid_area = grid["area_m2"].sum()
    assert np.isclose(total_grid_area, expected_area_m2, rtol=1e-4)
