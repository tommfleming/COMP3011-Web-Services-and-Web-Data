import pytest
from social.models import Follow, ReadingLog, Review

pytestmark = pytest.mark.django_db


def test_user_can_follow_another_user(auth_client, second_user):
    response = auth_client.post(
        "/api/social/follows/",
        {"following_id": second_user.id},
        format="json",
    )

    assert response.status_code == 201
    assert Follow.objects.count() == 1


def test_user_cannot_follow_themselves(auth_client, user):
    response = auth_client.post(
        "/api/social/follows/",
        {"following_id": user.id},
        format="json",
    )

    assert response.status_code == 400


def test_user_can_delete_follow(auth_client, user, second_user):
    follow = Follow.objects.create(follower=user, following=second_user)

    response = auth_client.delete(f"/api/social/follows/{follow.id}/")

    assert response.status_code == 204
    assert Follow.objects.count() == 0


def test_feed_returns_followed_user_review(auth_client, user, second_user, book):
    Follow.objects.create(follower=user, following=second_user)
    Review.objects.create(user=second_user, book=book, rating=5, text="Great")

    response = auth_client.get("/api/social/feed/")

    assert response.status_code == 200
    assert len(response.data) >= 1
    assert response.data[0]["type"] == "review"


def test_feed_returns_followed_user_reading_log(auth_client, user, second_user, book):
    Follow.objects.create(follower=user, following=second_user)
    ReadingLog.objects.create(user=second_user, book=book, status="reading")

    response = auth_client.get("/api/social/feed/")

    assert response.status_code == 200
    assert len(response.data) >= 1
    assert response.data[0]["type"] in ["reading_log", "review"]


def test_feed_empty_if_following_no_one(auth_client):
    response = auth_client.get("/api/social/feed/")

    assert response.status_code == 200
    assert response.data == []