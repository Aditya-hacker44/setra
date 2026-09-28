import math
from typing import Tuple, List, Optional, Dict, Any

try:
    from pyproj import CRS, Transformer
    HAS_PYPROJ = True
except ImportError:
    HAS_PYPROJ = False

def detect_crs(crs_input: Optional[str] = None) -> str:
    """Detect or parse Coordinate Reference System (CRS)."""
    if not crs_input:
        return "EPSG:4326 (WGS 84 Geographic 2D)"
    clean = str(crs_input).strip()
    if "4326" in clean or "wgs84" in clean.lower():
        return "EPSG:4326 (WGS 84 Geographic 2D)"
    if "32644" in clean or ("utm" in clean.lower() and "44" in clean):
        return "EPSG:32644 (WGS 84 / UTM Zone 44N - North India)"
    if "32643" in clean or ("utm" in clean.lower() and "43" in clean):
        return "EPSG:32643 (WGS 84 / UTM Zone 43N - West/South India)"
    if "32645" in clean or ("utm" in clean.lower() and "45" in clean):
        return "EPSG:32645 (WGS 84 / UTM Zone 45N - East India)"
    return f"EPSG:{clean}"

def get_optimal_model_crs(lng: float, lat: float) -> Dict[str, Any]:
    """Determines appropriate projected/model CRS (metric UTM) for terrain and numerical mesh calculations.
    
    Correction #2: Preserves source CRS and uses appropriate projected model CRS in meters 
    for numerical simulation, reserving EPSG:4326 strictly for web/API map display.
    """
    zone = int((lng + 180) / 6) + 1
    epsg_code = 32600 + zone if lat >= 0 else 32700 + zone
    
    region_name = (
        "North India (Uttarakhand / Ganga)" if zone == 44 else
        "West / South India (Gujarat / Kerala / Narmada / Periyar)" if zone == 43 else
        "East India (Odisha / Mahanadi / Brahmaputra)" if zone == 45 else
        f"UTM Zone {zone}N"
    )

    return {
        "modelCrs": f"EPSG:{epsg_code}",
        "epsg": epsg_code,
        "utmZone": zone,
        "units": "meters",
        "description": f"WGS 84 / UTM Zone {zone}N ({region_name})",
        "isProjected": True,
        "webInterchangeCrs": "EPSG:4326 (WGS 84)"
    }

def transform_point(
    x: float, 
    y: float, 
    src_crs: str = "EPSG:4326", 
    dst_crs: str = "EPSG:32644"
) -> Tuple[float, float]:
    """Transform coordinates between source coordinate system and target model/web coordinate system."""
    if src_crs == dst_crs:
        return (x, y)

    if HAS_PYPROJ:
        try:
            transformer = Transformer.from_crs(src_crs, dst_crs, always_xy=True)
            return transformer.transform(x, y)
        except Exception:
            pass

    # Mathematical projection fallback for Indian latitudes if pyproj unavailable
    if src_crs == "EPSG:4326" and "326" in dst_crs:
        zone = int(dst_crs.replace("EPSG:", "")[-2:])
        central_meridian = (zone - 1) * 6 - 180 + 3
        lat_rad = math.radians(y)
        lng_diff = math.radians(x - central_meridian)
        
        # Approximate Transverse Mercator forward projection
        k0 = 0.9996
        a = 6378137.0
        mx = 500000 + a * k0 * lng_diff * math.cos(lat_rad)
        my = a * k0 * lat_rad
        return (mx, my)

    return (x, y)
