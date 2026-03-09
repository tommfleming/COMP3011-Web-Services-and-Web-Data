import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_authenticated_user_can_create_shelf():
    user = User.objects.create_user(username="testuser", password="password123")
    client = APIClient()
    client.login(username="testuser", password="password123")

    response = client.post(
        "/api/social/shelves/",
        {"name": "Favourites", "is_public": True},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["name"] == "Favourites"