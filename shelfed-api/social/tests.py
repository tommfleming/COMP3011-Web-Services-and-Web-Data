import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from books.models import Author, Book
from social.models import Follow, ShelfItem

pytestmark = pytest.mark.django_db


def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


def create_book(title="Dune", genre="Science Fiction"):
    author = Author.objects.create(name="Frank Herbert")
    book = Book.objects.create(title=title, genre=genre, source="openlibrary", external_id=f"OL-{title}")
    book.authors.add(author)
    return book


def test_user_can_register():
    client = APIClient()

    response = client.post(
        "/api/auth/register/",
        {
            "username": "testuser1",
            "email": "test@example.com",
            "password": "StrongPass123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert "token" in response.data


def test_user_can_create_shelf_and_add_book():
    user = User.objects.create_user(username="alice", password="StrongPass123!")
    book = create_book()

    client = auth_client(user)

    shelf_response = client.post(
        "/api/social/shelves/",
        {"name": "Favourites", "is_public": True},
        format="json",
    )
    assert shelf_response.status_code == 201

    shelf_id = shelf_response.data["id"]

    item_response = client.post(
        f"/api/social/shelves/{shelf_id}/items/",
        {"book_id": book.id},
        format="json",
    )
    assert item_response.status_code == 201
    assert ShelfItem.objects.count() == 1


def test_user_can_follow_another_user():
    alice = User.objects.create_user(username="alice2", password="StrongPass123!")
    bob = User.objects.create_user(username="bob2", password="StrongPass123!")

    client = auth_client(alice)

    response = client.post(
        "/api/social/follows/",
        {"following_id": bob.id},
        format="json",
    )

    assert response.status_code == 201
    assert Follow.objects.count() == 1


def test_feed_returns_followed_user_review():
    alice = User.objects.create_user(username="alice3", password="StrongPass123!")
    bob = User.objects.create_user(username="bob3", password="StrongPass123!")
    book = create_book(title="Neuromancer")

    Follow.objects.create(follower=alice, following=bob)
    from social.models import Review
    Review.objects.create(user=bob, book=book, rating=5, text="Great")

    client = auth_client(alice)
    response = client.get("/api/social/feed/")

    assert response.status_code == 200
    assert len(response.data) >= 1