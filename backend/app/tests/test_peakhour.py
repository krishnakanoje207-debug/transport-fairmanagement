import asyncio

from app.routes.peak_hour import DEFAULT_HOURLY, get_time_recommendation


def test_default_hourly_has_24_entries():
    assert len(DEFAULT_HOURLY) == 24
    assert DEFAULT_HOURLY[0]["hour"] == 0
    assert DEFAULT_HOURLY[-1]["hour"] == 23


def test_recommendation_returns_expected_shape():
    result = asyncio.run(get_time_recommendation("MITS", "Railway Station"))
    assert result["from"] == "MITS"
    assert result["to"] == "Railway Station"
    assert "best_departure" in result
    assert "estimated_travel_time" in result
