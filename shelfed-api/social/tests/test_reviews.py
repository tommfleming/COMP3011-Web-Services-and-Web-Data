import pytest
from social.models import Review

pytestmark = pytest.mark.django_db


def test_user_can_create_review(auth_client, user, book):
    response = auth_client.post(
        "/api/social/reviews/",
        {
            "book_id": book.id,
            "rating": 5,
            "text": "Excellent",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["rating"] == 5
    assert Review.objects.count() == 1


def test_user_cannot_create_second_review_for_same_book(auth_client, user, book):
    Review.objects.create(user=user, book=book, rating=4, text="Good")

    response = auth_client.post(
        "/api/social/reviews/",
        {
            "book_id": book.id,
            "rating": 5,
            "text": "Excellent",
        },
        format="json",
    )

    assert response.status_code == 400


def test_review_rating_must_be_between_1_and_5(auth_client, book):
    response = auth_client.post(
        "/api/social/reviews/",
        {
            "book_id": book.id,
            "rating": 7,
            "text": "Too high",
        },
        format="json",
    )

    assert response.status_code == 400


def test_user_can_update_own_review(auth_client, user, book):
    review = Review.objects.create(user=user, book=book, rating=4, text="Good")

    response = auth_client.patch(
        f"/api/social/reviews/{review.id}/",
        {"rating": 5, "text": "Actually amazing"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["rating"] == 5


def test_user_can_delete_own_review(auth_client, user, book):
    review = Review.objects.create(user=user, book=book, rating=4, text="Good")

    response = auth_client.delete(f"/api/social/reviews/{review.id}/")

    assert response.status_code == 204
    assert Review.objects.count() == 0


def test_user_cannot_access_someone_elses_review(auth_client, second_user, book):
    review = Review.objects.create(user=second_user, book=book, rating=4, text="Good")

    response = auth_client.get(f"/api/social/reviews/{review.id}/")

    assert response.status_code == 404