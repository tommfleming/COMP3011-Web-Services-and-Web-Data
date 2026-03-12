import pytest

pytestmark = pytest.mark.django_db


def test_user_can_save_and_list_books(auth_client, book):
    save_response = auth_client.post(
        "/api/social/saved-books/",
        {"book_id": book.id},
        format="json",
    )
    assert save_response.status_code == 201

    list_response = auth_client.get("/api/social/saved-books/")
    assert list_response.status_code == 200
    assert len(list_response.data) == 1
    assert list_response.data[0]["title"] == "Dune"


def test_user_can_remove_saved_book(auth_client, book):
    auth_client.post("/api/social/saved-books/", {"book_id": book.id}, format="json")

    delete_response = auth_client.delete(f"/api/social/saved-books/{book.id}/")
    assert delete_response.status_code == 204

    list_response = auth_client.get("/api/social/saved-books/")
    assert list_response.status_code == 200
    assert list_response.data == []
