import pytest

from social.models import Follow, ReadingLog, Shelf, ShelfItem

pytestmark = pytest.mark.django_db


def test_friends_endpoint_groups_mutual_and_one_way_followers(auth_client, user, second_user, third_user):
    Follow.objects.create(follower=user, following=second_user)
    Follow.objects.create(follower=second_user, following=user)
    Follow.objects.create(follower=third_user, following=user)
    Follow.objects.create(follower=user, following=third_user)

    response = auth_client.get("/api/social/friends/")

    assert response.status_code == 200
    usernames = {entry["username"] for entry in response.data["friends"]}
    assert usernames == {"bob", "charlie"}


def test_my_profile_returns_recent_reads_and_shelves(auth_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Favourites", is_public=True)
    ShelfItem.objects.create(shelf=shelf, book=book)
    ReadingLog.objects.create(user=user, book=book, status="finished")

    response = auth_client.get("/api/social/profile/")

    assert response.status_code == 200
    assert response.data["user"]["username"] == "alice"
    assert len(response.data["shelves"]) == 1
    assert len(response.data["recent_reads"]) == 1


def test_public_profile_exposes_public_shelves_and_recent_reads(api_client, user, book):
    shelf = Shelf.objects.create(owner=user, name="Favourites", is_public=True)
    ShelfItem.objects.create(shelf=shelf, book=book)
    ReadingLog.objects.create(user=user, book=book, status="finished")

    response = api_client.get(f"/api/social/users/{user.username}/")

    assert response.status_code == 200
    assert len(response.data["public_shelves"]) == 1
    assert len(response.data["recent_reads"]) == 1
