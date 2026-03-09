from django.db.models import Avg, Count, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Shelf, ShelfItem, ReadingLog, Review, Follow
from .serializers import (
    ShelfSerializer,
    ShelfItemSerializer,
    ReadingLogSerializer,
    ReviewSerializer,
    FollowSerializer,
)
from books.models import Book


class ShelfListCreateView(generics.ListCreateAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ShelfDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(owner=self.request.user)


class ShelfItemCreateView(generics.CreateAPIView):
    serializer_class = ShelfItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        shelf = Shelf.objects.get(pk=self.kwargs["shelf_id"], owner=self.request.user)
        serializer.save(shelf=shelf)


class ShelfItemDeleteView(generics.DestroyAPIView):
    serializer_class = ShelfItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShelfItem.objects.filter(shelf__owner=self.request.user, shelf_id=self.kwargs["shelf_id"])

class PublicShelfListView(generics.ListAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Shelf.objects.filter(is_public=True).select_related("owner").prefetch_related("items__book")

class ReadingLogListCreateView(generics.ListCreateAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingLog.objects.filter(user=self.request.user)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)


class FollowListCreateView(generics.ListCreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)


class FollowDetailView(generics.DestroyAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user)


class FeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)

        reviews = Review.objects.filter(user_id__in=following_ids).select_related("user", "book").order_by("-created_at")[:20]
        logs = ReadingLog.objects.filter(user_id__in=following_ids).select_related("user", "book").order_by("-id")[:20]

        feed_items = []

        for review in reviews:
            feed_items.append({
                "type": "review",
                "username": review.user.username,
                "book": review.book.title,
                "rating": review.rating,
                "text": review.text,
                "created_at": review.created_at,
            })

        for log in logs:
            feed_items.append({
                "type": "reading_log",
                "username": log.user.username,
                "book": log.book.title,
                "status": log.status,
                "started_at": log.started_at,
                "finished_at": log.finished_at,
            })

        feed_items = sorted(
            feed_items,
            key=lambda x: x.get("created_at") or x.get("finished_at") or x.get("started_at") or 0,
            reverse=True,
        )

        return Response(feed_items[:20])


class WeeklyRecapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        finished_books = ReadingLog.objects.filter(user=request.user, status="finished").count()
        reviews_count = Review.objects.filter(user=request.user).count()
        public_shelves = Shelf.objects.filter(owner=request.user, is_public=True).count()

        avg_rating = Review.objects.filter(user=request.user).aggregate(avg=Avg("rating"))["avg"]

        return Response({
            "finished_books_total": finished_books,
            "reviews_total": reviews_count,
            "public_shelves_total": public_shelves,
            "average_rating": avg_rating,
        })


class RecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reviewed_book_ids = Review.objects.filter(user=request.user).values_list("book_id", flat=True)

        favourite_genres = (
            Review.objects.filter(user=request.user, rating__gte=4)
            .values("book__genre")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        top_genres = [item["book__genre"] for item in favourite_genres if item["book__genre"]][:3]

        following_ids = Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        socially_popular_book_ids = (
            Review.objects.filter(user_id__in=following_ids, rating__gte=4)
            .values("book_id")
            .annotate(total=Count("id"))
            .order_by("-total")
            .values_list("book_id", flat=True)
        )

        recommendations = Book.objects.exclude(id__in=reviewed_book_ids)

        if top_genres:
            recommendations = recommendations.filter(
                Q(genre__in=top_genres) | Q(id__in=socially_popular_book_ids)
            )
        else:
            recommendations = recommendations.filter(id__in=socially_popular_book_ids)

        recommendations = recommendations.distinct()[:10]

        data = []
        for book in recommendations:
            reasons = []
            if book.genre in top_genres:
                reasons.append(f"matches your interest in {book.genre}")
            if book.id in socially_popular_book_ids:
                reasons.append("liked by people you follow")

            data.append({
                "id": book.id,
                "title": book.title,
                "genre": book.genre,
                "reasons": reasons,
            })

        return Response(data)