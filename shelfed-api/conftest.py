import pytest
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from books.models import Author, Book


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def second_user():
    return User.objects.create_user(
        username="bob",
        email="bob@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def third_user():
    return User.objects.create_user(
        username="charlie",
        email="charlie@example.com",
        password="StrongPass123!",
    )


@pytest.fixture
def auth_client(user):
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def second_auth_client(second_user):
    token, _ = Token.objects.get_or_create(user=second_user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def author():
    return Author.objects.create(name="Frank Herbert")


@pytest.fixture
def second_author():
    return Author.objects.create(name="Isaac Asimov")


@pytest.fixture
def book(author):
    book = Book.objects.create(
        title="Dune",
        description="Sci-fi classic",
        published_year=1965,
        source="openlibrary",
        external_id="OL-DUNE",
        genre="Science Fiction",
        cover_url="https://example.com/dune.jpg",
        isbn13="9780441172719",
    )
    book.authors.add(author)
    return book


@pytest.fixture
def second_book(second_author):
    book = Book.objects.create(
        title="Foundation",
        description="Another sci-fi classic",
        published_year=1951,
        source="openlibrary",
        external_id="OL-FOUNDATION",
        genre="Science Fiction",
        cover_url="https://example.com/foundation.jpg",
        isbn13="9780553293357",
    )
    book.authors.add(second_author)
    return book


@pytest.fixture
def fantasy_book(author):
    book = Book.objects.create(
        title="The Fantasy Book",
        description="Epic fantasy adventure",
        published_year=2001,
        source="openlibrary",
        external_id="OL-FANTASY",
        genre="Fantasy",
        cover_url="https://example.com/fantasy.jpg",
        isbn13="9781234567890",
    )
    book.authors.add(author)
    return book