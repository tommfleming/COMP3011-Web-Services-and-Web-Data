import pytest

pytestmark = pytest.mark.django_db


def test_book_list_returns_books(api_client, book, second_book):
    response = api_client.get("/api/books/")

    assert response.status_code == 200
    assert response.data["count"] >= 2
    titles = [item["title"] for item in response.data["results"]]
    assert "Dune" in titles
    assert "Foundation" in titles


def test_book_detail_returns_single_book(api_client, book):
    response = api_client.get(f"/api/books/{book.id}/")

    assert response.status_code == 200
    assert response.data["title"] == "Dune"
    assert response.data["genre"] == "Science Fiction"


def test_book_search_by_title(api_client, book, second_book):
    response = api_client.get("/api/books/?q=dune")

    assert response.status_code == 200
    assert response.data["count"] >= 1
    assert response.data["results"][0]["title"] == "Dune"


def test_book_search_by_author(api_client, book):
    response = api_client.get("/api/books/?q=frank")

    assert response.status_code == 200
    assert response.data["count"] >= 1


def test_book_filter_by_genre(api_client, book, fantasy_book):
    response = api_client.get("/api/books/?genre=Fantasy")

    assert response.status_code == 200
    results = response.data["results"]
    assert len(results) >= 1
    assert all(item["genre"] == "Fantasy" for item in results)


def test_book_reviews_list(api_client, user, book):
    from social.models import Review

    Review.objects.create(user=user, book=book, rating=5, text="Amazing")

    response = api_client.get(f"/api/books/{book.id}/reviews/")

    assert response.status_code == 200
    assert len(response.data["results"]) == 1
    assert response.data["results"][0]["rating"] == 5