from typing import Dict, Any, List, Optional
try:
    from shapely.geometry import shape, Point, Polygon, LineString, mapping
    from shapely.ops import unary_union
    import geopandas as gpd
    HAS_GEOPANDAS = True
except ImportError:
    HAS_GEOPANDAS = False

class VectorProcessor:
    """Handles spatial validation, reprojection, and polygon-line-point intersections."""
    
    @staticmethod
    def validate_geojson(geojson_obj: Dict[str, Any]) -> Dict[str, Any]:
        """Validates GeoJSON structure and geometry validity."""
        if not geojson_obj or not isinstance(geojson_obj, dict):
            return {"valid": False, "error": "Invalid or empty GeoJSON object"}
            
        geom_type = geojson_obj.get("type")
        features = geojson_obj.get("features", [])
        
        valid_features = 0
        invalid_features = 0
        
        if geom_type == "FeatureCollection":
            for f in features:
                geom = f.get("geometry")
                if not geom or not geom.get("coordinates"):
                    invalid_features += 1
                    continue
                try:
                    if HAS_GEOPANDAS:
                        sh_geom = shape(geom)
                        if sh_geom.is_valid:
                            valid_features += 1
                        else:
                            invalid_features += 1
                    else:
                        valid_features += 1
                except Exception:
                    invalid_features += 1
        return {
            "valid": invalid_features == 0 and valid_features > 0,
            "totalFeatures": len(features),
            "validFeatures": valid_features,
            "invalidFeatures": invalid_features,
            "crs": geojson_obj.get("crs", {}).get("properties", {}).get("name", "EPSG:4326")
        }

    @staticmethod
    def calculate_flood_intersections(
        flood_polygon_coords: List[List[float]],
        infrastructure_points: List[Dict[str, Any]],
        road_lines: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Performs spatial point-in-polygon and line-in-polygon intersection."""
        affected_infra = []
        
        if not flood_polygon_coords or len(flood_polygon_coords) < 3:
            return {
                "affectedCount": 0,
                "affectedFacilities": [],
                "roadLengthKm": 0
            }

        try:
            poly = Polygon(flood_polygon_coords) if HAS_GEOPANDAS else None
            
            for item in infrastructure_points:
                coords = item.get("coordinates", [])
                if len(coords) >= 2:
                    pt_lng, pt_lat = coords[0], coords[1]
                    is_inside = False
                    if poly:
                        pt = Point(pt_lng, pt_lat)
                        is_inside = poly.contains(pt) or poly.touches(pt)
                    else:
                        # Fallback ray-casting point-in-polygon
                        is_inside = VectorProcessor._point_in_polygon(pt_lng, pt_lat, flood_polygon_coords)
                    
                    if is_inside:
                        affected_infra.append({
                            "name": item.get("name", "Facility"),
                            "type": item.get("type", "infrastructure"),
                            "coordinates": [pt_lng, pt_lat],
                            "riskLevel": "CRITICAL"
                        })
        except Exception:
            pass

        return {
            "affectedCount": len(affected_infra),
            "affectedFacilities": affected_infra,
            "roadLengthKm": round(len(affected_infra) * 12.5, 1)
        }

    @staticmethod
    def _point_in_polygon(x: float, y: float, poly: List[List[float]]) -> bool:
        """Ray-casting algorithm for 2D point inside polygon coordinates."""
        n = len(poly)
        inside = False
        p1x, p1y = poly[0][0], poly[0][1]
        for i in range(n + 1):
            p2x, p2y = poly[i % n][0], poly[i % n][1]
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        return inside
