from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
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

User = get_user_model()


class ShelfListCreateView(generics.ListCreateAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(owner=self.request.user).select_related("owner").prefetch_related("items__book__authors")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ShelfDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Shelf.objects.filter(owner=self.request.user).select_related("owner").prefetch_related("items__book__authors")


class PublicShelfListView(generics.ListAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Shelf.objects.filter(is_public=True).select_related("owner").prefetch_related("items__book__authors")


class PublicShelfDetailView(generics.RetrieveAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Shelf.objects.filter(is_public=True).select_related("owner").prefetch_related("items__book__authors")


class ShelfItemCreateView(generics.CreateAPIView):
    serializer_class = ShelfItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        shelf = get_object_or_404(Shelf, pk=self.kwargs["shelf_id"], owner=self.request.user)
        book = serializer.validated_data["book"]

        if ShelfItem.objects.filter(shelf=shelf, book=book).exists():
            raise ValidationError("This book is already on the shelf.")

        serializer.save(shelf=shelf)


class ShelfItemDeleteView(generics.DestroyAPIView):
    serializer_class = ShelfItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShelfItem.objects.filter(shelf__owner=self.request.user, shelf_id=self.kwargs["shelf_id"])


class ReadingLogListCreateView(generics.ListCreateAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingLog.objects.filter(user=self.request.user).select_related("book").prefetch_related("book__authors")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ReadingLog.objects.filter(user=self.request.user).select_related("book").prefetch_related("book__authors")


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related("book").prefetch_related("book__authors")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related("book").prefetch_related("book__authors")


class FollowListCreateView(generics.ListCreateAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).select_related("following")

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user)


class FollowDetailView(generics.DestroyAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Follow.objects.filter(follower=self.request.user).select_related("following")


class PublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)

        public_shelves = Shelf.objects.filter(owner=user, is_public=True).select_related("owner").prefetch_related("items__book__authors")[:5]

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
            },
            "stats": {
                "public_shelves": Shelf.objects.filter(owner=user, is_public=True).count(),
                "reviews": Review.objects.filter(user=user).count(),
                "followers": Follow.objects.filter(following=user).count(),
                "following": Follow.objects.filter(follower=user).count(),
            },
            "recent_public_shelves": ShelfSerializer(public_shelves, many=True).data,
        })


class FeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = list(
            Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        )

        reviews = Review.objects.filter(user_id__in=following_ids).select_related("user", "book").order_by("-created_at")[:20]
        logs = ReadingLog.objects.filter(user_id__in=following_ids).select_related("user", "book").order_by("-updated_at")[:20]

        feed_items = []

        for review in reviews:
            feed_items.append({
                "type": "review",
                "username": review.user.username,
                "book_id": review.book.id,
                "book_title": review.book.title,
                "rating": review.rating,
                "text": review.text,
                "timestamp": review.created_at,
            })

        for log in logs:
            feed_items.append({
                "type": "reading_log",
                "username": log.user.username,
                "book_id": log.book.id,
                "book_title": log.book.title,
                "status": log.status,
                "started_at": log.started_at,
                "finished_at": log.finished_at,
                "timestamp": log.updated_at,
            })

        feed_items.sort(key=lambda item: item["timestamp"], reverse=True)

        return Response(feed_items[:20])


class WeeklyRecapView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.filter(user=request.user)

        top_genre = (
            Review.objects.filter(user=request.user, rating__gte=4)
            .values("book__genre")
            .annotate(total=Count("id"))
            .exclude(book__genre="")
            .order_by("-total")
            .first()
        )

        return Response({
            "finished_books_total": ReadingLog.objects.filter(user=request.user, status="finished").count(),
            "currently_reading_total": ReadingLog.objects.filter(user=request.user, status="reading").count(),
            "want_to_read_total": ReadingLog.objects.filter(user=request.user, status="want_to_read").count(),
            "reviews_total": reviews.count(),
            "average_rating": reviews.aggregate(avg=Avg("rating"))["avg"],
            "top_genre": top_genre["book__genre"] if top_genre else None,
            "public_shelves_total": Shelf.objects.filter(owner=request.user, is_public=True).count(),
        })


class RecommendationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reviewed_book_ids = set(
            Review.objects.filter(user=request.user).values_list("book_id", flat=True)
        )

        favourite_genres = (
            Review.objects.filter(user=request.user, rating__gte=4)
            .values("book__genre")
            .annotate(total=Count("id"))
            .exclude(book__genre="")
            .order_by("-total")
        )

        top_genres = [item["book__genre"] for item in favourite_genres[:3]]

        following_ids = list(
            Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        )

        socially_popular_book_ids = set(
            Review.objects.filter(user_id__in=following_ids, rating__gte=4)
            .values("book_id")
            .annotate(total=Count("id"))
            .order_by("-total")
            .values_list("book_id", flat=True)
        )

        recommendations = Book.objects.exclude(id__in=reviewed_book_ids)

        if top_genres or socially_popular_book_ids:
            recommendations = recommendations.filter(
                Q(genre__in=top_genres) | Q(id__in=socially_popular_book_ids)
            )

        recommendations = recommendations.distinct().prefetch_related("authors")[:10]

        data = []
        for book in recommendations:
            reasons = []
            if book.genre in top_genres:
                reasons.append(f"matches your preferred genre: {book.genre}")
            if book.id in socially_popular_book_ids:
                reasons.append("liked by people you follow")

            data.append({
                "id": book.id,
                "title": book.title,
                "genre": book.genre,
                "cover_url": book.cover_url,
                "reasons": reasons,
            })

        return Response(data)