import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

pytestmark = pytest.mark.django_db


def test_user_can_register(api_client):
    response = api_client.post(
        "/api/auth/register/",
        {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert "token" in response.data
    assert response.data["user"]["username"] == "newuser"
    assert User.objects.filter(username="newuser").exists()


def test_user_can_login(api_client, user):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "alice",
            "password": "StrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 200
    assert "token" in response.data
    assert response.data["user"]["username"] == "alice"


def test_login_fails_with_bad_password(api_client, user):
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "alice",
            "password": "WrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "detail" in response.data


def test_authenticated_user_can_get_me(auth_client, user):
    response = auth_client.get("/api/auth/me/")

    assert response.status_code == 200
    assert response.data["username"] == user.username


def test_unauthenticated_user_cannot_get_me(api_client):
    response = api_client.get("/api/auth/me/")
    assert response.status_code == 401


def test_authenticated_user_can_logout(auth_client, user):
    response = auth_client.post("/api/auth/logout/")

    assert response.status_code == 204
    assert Token.objects.filter(user=user).count() == 0