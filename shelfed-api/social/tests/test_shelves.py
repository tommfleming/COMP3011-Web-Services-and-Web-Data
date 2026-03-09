import pytest
from social.models import Shelf, ShelfItem

pytestmark = pytest.mark.django_db


def test_authenticated_user_can_create_shelf(auth_client):
    response = auth_client.post(
        "/api/social/shelves/",
        {"name": "Favourites", "is_public": True},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["name"] == "Favourites"
    assert Shelf.objects.count() == 1


def test_user_only_sees_their_own_shelves(auth_client, second_user):
    Shelf.objects.create(owner=second_user, name="Bob Shelf", is_public=True)

    response = auth_client.get("/api/social/shelves/")

    assert response.status_code == 200
    assert response.data["count"] == 0


def test_user_can_get_single_own_shelf(auth_client, user):
    shelf = Shelf.objects.create(owner=user, name="Sci-Fi", is_public=True)

    response = auth_client.get(f"/api/social/shelves/{shelf.id}/")

    assert response.status_code == 200
    assert response.data["name"] == "Sci-Fi"


def test_user_cannot_get_someone_elses_shelf(auth_client, second_user):
    shelf = Shelf.objects.create(owner=second_user, name="Bob Shelf", is_public=True)

    response = auth_client.get(f"/api/social/shelves/{shelf.id}/")

    assert response.status_code == 404


def test_user_can_update_own_shelf(auth_client, user):
    shelf = Shelf.objects.create(owner=user, name="Old Name", is_public=True)

    response = auth_client.patch(
        f"/api/social/shelves/{shelf.id}/",
        {"name": "New Name"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["name"] == "New Name"


def test_user_can_delete_own_shelf(auth_client, user):
    shelf = Shelf.objects.create(owner=user, name="Delete Me", is_public=True)

    response = auth_client.delete(f"/api/social/shelves/{shelf.id}/")

    assert response.status_code == 204
    assert Shelf.objects.count() == 0


def test_user_can_add_book_to_shelf(auth_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Sci-Fi", is_public=True)

    response = auth_client.post(
        f"/api/social/shelves/{shelf.id}/items/",
        {"book_id": book.id},
        format="json",
    )

    assert response.status_code == 201
    assert ShelfItem.objects.count() == 1


def test_user_cannot_add_same_book_to_shelf_twice(auth_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Sci-Fi", is_public=True)
    ShelfItem.objects.create(shelf=shelf, book=book)

    response = auth_client.post(
        f"/api/social/shelves/{shelf.id}/items/",
        {"book_id": book.id},
        format="json",
    )

    assert response.status_code == 400


def test_user_can_remove_book_from_shelf(auth_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Sci-Fi", is_public=True)
    item = ShelfItem.objects.create(shelf=shelf, book=book)

    response = auth_client.delete(
        f"/api/social/shelves/{shelf.id}/items/{item.id}/"
    )

    assert response.status_code == 204
    assert ShelfItem.objects.count() == 0