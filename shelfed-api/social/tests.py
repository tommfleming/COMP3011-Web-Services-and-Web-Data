import pytest
import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from books.models import Author, Book
from social.models import ShelfItem

pytestmark = pytest.mark.django_db


def create_book(title="Dune", genre="Science Fiction"):
    author = Author.objects.create(name="Frank Herbert")
    book = Book.objects.create(title=title, genre=genre)
    book.authors.add(author)
    return book


def test_authenticated_user_can_create_shelf():
    user = User.objects.create_user(username="testuser1", password="password123")
    client = APIClient()
    client.login(username="testuser1", password="password123")

    response = client.post("/api/social/shelves/", {"name": "Favourites", "is_public": True}, format="json")

    assert response.status_code == 201
    assert response.data["name"] == "Favourites"


def test_user_can_add_book_to_shelf():
    user = User.objects.create_user(username="testuser2", password="password123")
    book = create_book()

    client = APIClient()
    client.login(username="testuser2", password="password123")

    shelf_response = client.post("/api/social/shelves/", {"name": "Sci-Fi", "is_public": True}, format="json")
    shelf_id = shelf_response.data["id"]

    response = client.post(
        f"/api/social/shelves/{shelf_id}/items/",
        {"book_id": book.id},
        format="json",
    )

    assert response.status_code == 201
    assert ShelfItem.objects.count() == 1


def test_user_can_create_review():
    user = User.objects.create_user(username="testuser3", password="password123")
    book = create_book()

    client = APIClient()
    client.login(username="testuser3", password="password123")

    response = client.post(
        "/api/social/reviews/",
        {"book": book.id, "rating": 5, "text": "Excellent"},
        format="json",
    )

    assert response.status_code == 201
    assert response.data["rating"] == 5


def test_user_can_follow_another_user():
    user1 = User.objects.create_user(username="alice", password="password123")
    user2 = User.objects.create_user(username="bob", password="password123")

    client = APIClient()
    client.login(username="alice", password="password123")

    response = client.post(
        "/api/social/follows/",
        {"following": user2.id},
        format="json",
    )

    assert response.status_code == 201