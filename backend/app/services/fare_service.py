"""SafeRoute - Fare Service"""

FARE_TABLE = {
    "bus": {"base": 10, "per_km": 2.5, "min_fare": 10},
    "auto": {"base": 25, "per_km": 12, "min_fare": 25},
    "cab": {"base": 50, "per_km": 15, "min_fare": 50},
}

PEAK_MULTIPLIER = 1.2


def calculate_fare(transport_type: str, distance_km: float, is_peak: bool = False) -> float:
    rates = FARE_TABLE.get(transport_type, FARE_TABLE["bus"])
    fare = rates["base"] + rates["per_km"] * distance_km
    if is_peak:
        fare *= PEAK_MULTIPLIER
    return round(max(fare, rates["min_fare"]), 2)


def is_peak_hour(hour: int) -> bool:
    return hour in range(7, 10) or hour in range(17, 20)
