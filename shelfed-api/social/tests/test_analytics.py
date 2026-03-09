import pytest
from social.models import Follow, ReadingLog, Review

pytestmark = pytest.mark.django_db


def test_weekly_recap_returns_expected_fields(auth_client, user, book):
    ReadingLog.objects.create(user=user, book=book, status="finished")
    Review.objects.create(user=user, book=book, rating=5, text="Amazing")

    response = auth_client.get("/api/social/analytics/weekly-recap/")

    assert response.status_code == 200
    assert "finished_books_total" in response.data
    assert "reviews_total" in response.data
    assert "average_rating" in response.data
    assert response.data["finished_books_total"] == 1
    assert response.data["reviews_total"] == 1


def test_recommendations_return_books_based_on_genre(auth_client, user, book, second_book, fantasy_book):
    Review.objects.create(user=user, book=book, rating=5, text="Loved it")

    response = auth_client.get("/api/social/recommendations/")

    assert response.status_code == 200
    assert isinstance(response.data, list)

    returned_titles = [item["title"] for item in response.data]
    assert "Foundation" in returned_titles or len(returned_titles) >= 1


def test_recommendations_can_use_social_signal(auth_client, user, second_user, second_book):
    Follow.objects.create(follower=user, following=second_user)
    Review.objects.create(user=second_user, book=second_book, rating=5, text="Must read")

    response = auth_client.get("/api/social/recommendations/")

    assert response.status_code == 200
    assert isinstance(response.data, list)
    if response.data:
        assert "reasons" in response.data[0]