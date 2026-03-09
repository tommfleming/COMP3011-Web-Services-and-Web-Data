import pytest
from social.models import Review, Shelf, ShelfItem, Follow

pytestmark = pytest.mark.django_db


def test_public_shelves_list_returns_only_public_shelves(api_client, user, second_user, book):
    public_shelf = Shelf.objects.create(owner=user, name="Public Shelf", is_public=True)
    private_shelf = Shelf.objects.create(owner=second_user, name="Private Shelf", is_public=False)

    ShelfItem.objects.create(shelf=public_shelf, book=book)

    response = api_client.get("/api/social/public-shelves/")

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["name"] == "Public Shelf"


def test_public_shelf_detail_returns_nested_items(api_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Public Shelf", is_public=True)
    ShelfItem.objects.create(shelf=shelf, book=book)

    response = api_client.get(f"/api/social/public-shelves/{shelf.id}/")

    assert response.status_code == 200
    assert response.data["name"] == "Public Shelf"
    assert len(response.data["items"]) == 1
    assert response.data["items"][0]["book"]["title"] == "Dune"


def test_public_profile_returns_stats(api_client, user, second_user, book):
    shelf = Shelf.objects.create(owner=user, name="Public Shelf", is_public=True)
    ShelfItem.objects.create(shelf=shelf, book=book)
    Review.objects.create(user=user, book=book, rating=5, text="Amazing")
    Follow.objects.create(follower=second_user, following=user)

    response = api_client.get(f"/api/social/users/{user.username}/")

    assert response.status_code == 200
    assert response.data["user"]["username"] == user.username
    assert "stats" in response.data
    assert response.data["stats"]["public_shelves"] == 1
    assert response.data["stats"]["reviews"] == 1
    assert response.data["stats"]["followers"] == 1