import pytest

from books.models import Book

pytestmark = pytest.mark.django_db


def test_authenticated_user_can_create_manual_book(auth_client):
    response = auth_client.post(
        "/api/books/create/",
        {
            "title": "the left hand of darkness",
            "author_names": ["ursula le guin"],
            "genre": "Science Fiction",
            "description": "Classic speculative fiction",
            "published_year": 1969,
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["title"] == "The Left Hand Of Darkness"
    assert response.data["source"] == "manual"
    assert Book.objects.filter(title="The Left Hand Of Darkness").exists()


def test_duplicate_manual_book_is_rejected(auth_client, author):
    book = Book.objects.create(
        title="Dune",
        source="manual",
        external_id="manual-dune",
        genre="Science Fiction",
    )
    book.authors.add(author)

    response = auth_client.post(
        "/api/books/create/",
        {
            "title": "dune",
            "author_names": ["Frank Herbert"],
            "genre": "Science Fiction",
        },
        format="json",
    )

    assert response.status_code == 400
