from app.routes.auth import _generate_password, _user_response


def test_generate_password_has_requested_length_and_variety():
    password = _generate_password(14)
    assert len(password) == 14
    allowed = set("!@#$")
    assert all(ch.isalnum() or ch in allowed for ch in password)


def test_user_response_maps_required_fields():
    user = {
        "_id": "507f1f77bcf86cd799439011",
        "email": "guardian@example.com",
        "first_name": "Sam",
        "last_name": "Rao",
        "role": "guardian",
        "is_active": True,
    }

    response = _user_response(user)

    assert response["id"] == "507f1f77bcf86cd799439011"
    assert response["email"] == "guardian@example.com"
    assert response["role"] == "guardian"
    assert response["is_active"] is True
