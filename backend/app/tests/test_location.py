from app.models.location_model import LocationUpdate


def test_location_update_defaults_source_to_gps():
    payload = LocationUpdate(
        trip_id="trip_123",
        latitude=26.22,
        longitude=78.18,
    )
    assert payload.source == "gps"


def test_location_update_accepts_optional_fields():
    payload = LocationUpdate(
        trip_id="trip_456",
        latitude=26.20,
        longitude=78.10,
        accuracy=3.5,
        speed=18.2,
        heading=44.0,
        source="cell_tower",
    )
    assert payload.accuracy == 3.5
    assert payload.speed == 18.2
    assert payload.heading == 44.0
    assert payload.source == "cell_tower"
