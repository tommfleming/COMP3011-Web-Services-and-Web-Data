from django.urls import path

from .views import BookCreateView, BookDetailView, BookListView, BookReviewListView

urlpatterns = [
    path("", BookListView.as_view(), name="book-list"),
    path("create/", BookCreateView.as_view(), name="book-create"),
    path("<int:pk>/", BookDetailView.as_view(), name="book-detail"),
    path("<int:book_id>/reviews/", BookReviewListView.as_view(), name="book-review-list"),
]
