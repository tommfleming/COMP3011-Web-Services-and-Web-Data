from django.urls import path

from .views import (
    FeedView,
    FollowDetailView,
    FollowListCreateView,
    FriendsListView,
    MyProfileView,
    PublicProfileView,
    PublicShelfDetailView,
    PublicShelfListView,
    ReadingLogDetailView,
    ReadingLogListCreateView,
    RecommendationView,
    ReviewDetailView,
    ReviewListCreateView,
    SavedBookDeleteView,
    SavedBooksView,
    ShelfDetailView,
    ShelfItemCreateView,
    ShelfItemDeleteView,
    ShelfListCreateView,
    WeeklyRecapView,
)

urlpatterns = [
    path("shelves/", ShelfListCreateView.as_view(), name="shelf-list-create"),
    path("shelves/<int:pk>/", ShelfDetailView.as_view(), name="shelf-detail"),
    path("shelves/<int:shelf_id>/items/", ShelfItemCreateView.as_view(), name="shelf-item-create"),
    path("shelves/<int:shelf_id>/items/<int:pk>/", ShelfItemDeleteView.as_view(), name="shelf-item-delete"),

    path("saved-books/", SavedBooksView.as_view(), name="saved-books"),
    path("saved-books/<int:book_id>/", SavedBookDeleteView.as_view(), name="saved-book-delete"),

    path("public-shelves/", PublicShelfListView.as_view(), name="public-shelf-list"),
    path("public-shelves/<int:pk>/", PublicShelfDetailView.as_view(), name="public-shelf-detail"),

    path("profile/", MyProfileView.as_view(), name="my-profile"),
    path("users/<str:username>/", PublicProfileView.as_view(), name="public-profile"),
    path("friends/", FriendsListView.as_view(), name="friends-list"),

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
