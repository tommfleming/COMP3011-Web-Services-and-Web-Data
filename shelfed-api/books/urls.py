from django.urls import path
from .views import BookListView, BookDetailView, BookReviewListView

urlpatterns = [
    path("", BookListView.as_view(), name="book-list"),
    path("<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("<int:book_id>/reviews/", BookReviewListView.as_view(), name="book-review-list"),
]