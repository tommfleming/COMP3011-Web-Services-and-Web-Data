from django.urls import path
from .views import (
    ShelfListCreateView,
    ShelfDetailView,
    PublicShelfListView,
    PublicShelfDetailView,
    ShelfItemCreateView,
    ShelfItemDeleteView,
    ReadingLogListCreateView,
    ReadingLogDetailView,
    ReviewListCreateView,
    ReviewDetailView,
    FollowListCreateView,
    FollowDetailView,
    PublicProfileView,
    FeedView,
    WeeklyRecapView,
    RecommendationView,
)

urlpatterns = [
    path("shelves/", ShelfListCreateView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("shelves/<int:shelf_id>/items/", ShelfItemCreateView.as_view(), name="shelf-item-create"),
    path("shelves/<int:shelf_id>/items/<int:pk>/", ShelfItemDeleteView.as_view(), name="shelf-item-delete"),

    path("public-shelves/", PublicShelfListView.as_view(), name="public-shelf-list"),
    path("public-shelves/<int:pk>/", PublicShelfDetailView.as_view(), name="public-shelf-detail"),
    path("users/<str:username>/", PublicProfileView.as_view(), name="public-profile"),

    path("logs/", ReadingLogListCreateView.as_view(), name="log-list-create"),
    path("logs/<int:pk>/", ReadingLogDetailView.as_view(), name="log-detail"),

    path("reviews/", ReviewListCreateView.as_view(), name="review-list-create"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),

    path("follows/", FollowListCreateView.as_view(), name="follow-list-create"),
    path("follows/<int:pk>/", FollowDetailView.as_view(), name="follow-detail"),

    path("feed/", FeedView.as_view(), name="feed"),
    path("analytics/weekly-recap/", WeeklyRecapView.as_view(), name="weekly-recap"),
    path("recommendations/", RecommendationView.as_view(), name="recommendations"),
]