"""
Geographical Utilities
Distance calculation, coordinate validation, and route analysis
"""
from math import radians, cos, sin, asin, sqrt
from typing import Tuple, List, Dict, Optional
from geopy.distance import geodesic
import asyncio


class GeoUtils:
    """Geographical calculation utilities"""
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two points using Haversine formula
        
        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates
        
        Returns:
            Distance in meters
        """
        # Convert to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Earth radius in meters
        r = 6371000
        
        return c * r
    
    @staticmethod
    def calculate_distance(point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """
        Calculate distance between two coordinate points
        
        Args:
            point1: Dict with 'latitude' and 'longitude'
            point2: Dict with 'latitude' and 'longitude'
        
        Returns:
            Distance in meters
        """
        return GeoUtils.haversine_distance(
            point1['latitude'], point1['longitude'],
            point2['latitude'], point2['longitude']
        )
    
    @staticmethod
    def is_within_safe_distance(
        user_location: Dict[str, float],
        vehicle_location: Dict[str, float],
        safe_limit_meters: float = 300
    ) -> Tuple[bool, float]:
        """
        Check if user is within safe distance from vehicle
        
        Args:
            user_location: User coordinates
            vehicle_location: Vehicle coordinates
            safe_limit_meters: Safe distance threshold
        
        Returns:
            Tuple of (is_safe, actual_distance_meters)
        """
        distance = GeoUtils.calculate_distance(user_location, vehicle_location)
        is_safe = distance <= safe_limit_meters
        return is_safe, distance
    
    @staticmethod
    def calculate_route_distance(waypoints: List[Dict[str, float]]) -> float:
        """
        Calculate total distance along a route with multiple waypoints
        
        Args:
            waypoints: List of coordinate dicts
        
        Returns:
            Total distance in meters
        """
        if len(waypoints) < 2:
            return 0.0
        
        total_distance = 0.0
        for i in range(len(waypoints) - 1):
            total_distance += GeoUtils.calculate_distance(waypoints[i], waypoints[i + 1])
        
        return total_distance
    
    @staticmethod
    def get_midpoint(point1: Dict[str, float], point2: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate midpoint between two coordinates
        
        Args:
            point1: First point coordinates
            point2: Second point coordinates
        
        Returns:
            Midpoint coordinates
        """
        return {
            'latitude': (point1['latitude'] + point2['latitude']) / 2,
            'longitude': (point1['longitude'] + point2['longitude']) / 2
        }
    
    @staticmethod
    def validate_coordinates(lat: float, lng: float) -> bool:
        """
        Validate coordinate values
        
        Args:
            lat: Latitude
            lng: Longitude
        
        Returns:
            True if valid, False otherwise
        """
        return -90 <= lat <= 90 and -180 <= lng <= 180
    
    @staticmethod
    def calculate_bearing(point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """
        Calculate bearing/direction from point1 to point2
        
        Args:
            point1: Start point
            point2: End point
        
        Returns:
            Bearing in degrees (0-360)
        """
        lat1, lon1 = radians(point1['latitude']), radians(point1['longitude'])
        lat2, lon2 = radians(point2['latitude']), radians(point2['longitude'])
        
        dlon = lon2 - lon1
        
        x = sin(dlon) * cos(lat2)
        y = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlon)
        
        initial_bearing = atan2(x, y)
        initial_bearing = degrees(initial_bearing)
        compass_bearing = (initial_bearing + 360) % 360
        
        return compass_bearing
    
    @staticmethod
    def estimate_travel_time(distance_meters: float, transport_type: str = "bus") -> float:
        """
        Estimate travel time based on distance and transport type
        
        Args:
            distance_meters: Distance in meters
            transport_type: 'bus', 'auto', or 'cab'
        
        Returns:
            Estimated time in minutes
        """
        # Average speeds in km/h
        speeds = {
            'bus': 30,
            'auto': 35,
            'cab': 40
        }
        
        speed_kmh = speeds.get(transport_type, 30)
        distance_km = distance_meters / 1000
        time_hours = distance_km / speed_kmh
        time_minutes = time_hours * 60
        
        # Add buffer time for stops/traffic
        buffer_factor = 1.2
        return time_minutes * buffer_factor


# Import math functions
from math import atan2, degrees


# Convenience functions
def calculate_distance(point1: Dict[str, float], point2: Dict[str, float]) -> float:
    """Calculate distance between two points in meters"""
    return GeoUtils.calculate_distance(point1, point2)


def is_within_safe_distance(
    user_location: Dict[str, float],
    vehicle_location: Dict[str, float],
    safe_limit: float = 300
) -> Tuple[bool, float]:
    """Check if within safe distance"""
    return GeoUtils.is_within_safe_distance(user_location, vehicle_location, safe_limit)


def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate coordinates"""
    return GeoUtils.validate_coordinates(lat, lng)
