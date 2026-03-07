from django.urls import path
from .views import (
    ShelfListCreateView,
    ShelfDetailView,
    ReadingLogListCreateView,
    ReviewListCreateView,
    FollowListCreateView,
)

urlpatterns = [
    path("shelves/", ShelfListCreateView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("logs/", ReadingLogListCreateView.as_view(), name="log-list-create"),
    path("reviews/", ReviewListCreateView.as_view(), name="review-list-create"),
    path("follows/", FollowListCreateView.as_view(), name="follow-list-create"),
]