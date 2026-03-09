import pytest
from social.models import ReadingLog

pytestmark = pytest.mark.django_db


def test_user_can_create_reading_log(auth_client, user, book):
    response = auth_client.post(
        "/api/social/logs/",
        {
            "book_id": book.id,
            "status": "reading",
            "started_at": "2026-03-09",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["status"] == "reading"
    assert ReadingLog.objects.count() == 1


def test_user_can_list_own_logs(auth_client, user, book):
    ReadingLog.objects.create(user=user, book=book, status="reading")

    response = auth_client.get("/api/social/logs/")

    assert response.status_code == 200
    assert response.data["count"] == 1


def test_user_can_update_own_log(auth_client, user, book):
    log = ReadingLog.objects.create(user=user, book=book, status="reading")

    response = auth_client.patch(
        f"/api/social/logs/{log.id}/",
        {"status": "finished", "finished_at": "2026-03-10"},
        format="json",
    )

    assert response.status_code == 200
    assert response.data["status"] == "finished"


def test_user_can_delete_own_log(auth_client, user, book):
    log = ReadingLog.objects.create(user=user, book=book, status="reading")

    response = auth_client.delete(f"/api/social/logs/{log.id}/")

    assert response.status_code == 204
    assert ReadingLog.objects.count() == 0


def test_user_cannot_access_someone_elses_log(auth_client, second_user, book):
    other_log = ReadingLog.objects.create(user=second_user, book=book, status="reading")

    response = auth_client.get(f"/api/social/logs/{other_log.id}/")

    assert response.status_code == 404