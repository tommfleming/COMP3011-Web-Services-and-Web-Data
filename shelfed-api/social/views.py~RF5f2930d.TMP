from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from books.models import Book
from books.serializers import BookSerializer
from .models import Follow, ReadingLog, Review, Shelf, ShelfItem
from .serializers import (
    FollowSerializer,
    ReadingLogSerializer,
    ReviewSerializer,
    ShelfItemSerializer,
    ShelfSerializer,
    SimpleUserSerializer,
)

User = get_user_model()
SAVED_SHELF_NAME = "Saved for Later"


def get_or_create_saved_shelf(user):
    shelf, _ = Shelf.objects.get_or_create(
        owner=user,
        name=SAVED_SHELF_NAME,
        defaults={"is_public": False},
    )
    return shelf


class ShelfListCreateView(generics.ListCreateAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Shelf.objects.filter(owner=self.request.user)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ShelfDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Shelf.objects.filter(owner=self.request.user)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )


class PublicShelfListView(generics.ListAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Shelf.objects.filter(is_public=True)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )


class PublicShelfDetailView(generics.RetrieveAPIView):
    serializer_class = ShelfSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Shelf.objects.filter(is_public=True)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )


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
        return ShelfItem.objects.filter(
            shelf__owner=self.request.user,
            shelf_id=self.kwargs["shelf_id"],
        )


class SavedBooksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved_shelf = get_or_create_saved_shelf(request.user)
        items = (
            ShelfItem.objects.filter(shelf=saved_shelf)
            .select_related("book")
            .prefetch_related("book__authors")
            .order_by("-added_at")
        )
        books = [item.book for item in items]
        return Response(BookSerializer(books, many=True).data)

    def post(self, request):
        saved_shelf = get_or_create_saved_shelf(request.user)
        book_id = request.data.get("book_id")
        if not book_id:
            raise ValidationError({"book_id": "This field is required."})

        book = get_object_or_404(Book, pk=book_id)

        if ShelfItem.objects.filter(shelf=saved_shelf, book=book).exists():
            raise ValidationError({"book_id": "This book is already saved."})

        ShelfItem.objects.create(shelf=saved_shelf, book=book)
        return Response(BookSerializer(book).data, status=201)


class SavedBookDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, book_id):
        saved_shelf = get_or_create_saved_shelf(request.user)
        item = get_object_or_404(ShelfItem, shelf=saved_shelf, book_id=book_id)
        item.delete()
        return Response(status=204)


class ReadingLogListCreateView(generics.ListCreateAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ReadingLog.objects.filter(user=self.request.user)
            .select_related("book")
            .prefetch_related("book__authors")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReadingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReadingLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            ReadingLog.objects.filter(user=self.request.user)
            .select_related("book")
            .prefetch_related("book__authors")
        )


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Review.objects.filter(user=self.request.user)
            .select_related("book")
            .prefetch_related("book__authors")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Review.objects.filter(user=self.request.user)
            .select_related("book")
            .prefetch_related("book__authors")
        )


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


class FriendsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = set(
            Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        )
        follower_ids = set(
            Follow.objects.filter(following=request.user).values_list("follower_id", flat=True)
        )

        mutual_ids = following_ids & follower_ids
        following_only_ids = following_ids - mutual_ids
        followers_only_ids = follower_ids - mutual_ids

        return Response(
            {
                "friends": SimpleUserSerializer(
                    User.objects.filter(id__in=mutual_ids).order_by("username"),
                    many=True,
                ).data,
                "following_only": SimpleUserSerializer(
                    User.objects.filter(id__in=following_only_ids).order_by("username"),
                    many=True,
                ).data,
                "followers_only": SimpleUserSerializer(
                    User.objects.filter(id__in=followers_only_ids).order_by("username"),
                    many=True,
                ).data,
            }
        )


class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        saved_shelf = get_or_create_saved_shelf(request.user)

        recent_reads = (
            ReadingLog.objects.filter(user=request.user, status="finished")
            .select_related("book")
            .prefetch_related("book__authors")
            .order_by("-updated_at")[:5]
        )

        shelves = (
            Shelf.objects.filter(owner=request.user)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )

        return Response(
            {
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                },
                "stats": {
                    "reviews": Review.objects.filter(user=request.user).count(),
                    "followers": Follow.objects.filter(following=request.user).count(),
                    "following": Follow.objects.filter(follower=request.user).count(),
                    "saved_books": ShelfItem.objects.filter(shelf=saved_shelf).count(),
                },
                "recent_reads": ReadingLogSerializer(recent_reads, many=True).data,
                "shelves": ShelfSerializer(shelves, many=True).data,
            }
        )


class PublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)

        public_shelves = (
            Shelf.objects.filter(owner=user, is_public=True)
            .exclude(name=SAVED_SHELF_NAME)
            .select_related("owner")
            .prefetch_related("items__book__authors")
        )[:5]

        recent_reads = (
            ReadingLog.objects.filter(user=user, status="finished")
            .select_related("book")
            .prefetch_related("book__authors")
            .order_by("-updated_at")[:5]
        )

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                },
                "stats": {
                    "public_shelves": Shelf.objects.filter(owner=user, is_public=True)
                    .exclude(name=SAVED_SHELF_NAME)
                    .count(),
                    "reviews": Review.objects.filter(user=user).count(),
                    "followers": Follow.objects.filter(following=user).count(),
                    "following": Follow.objects.filter(follower=user).count(),
                },
                "recent_reads": ReadingLogSerializer(recent_reads, many=True).data,
                "public_shelves": ShelfSerializer(public_shelves, many=True).data,
            }
        )


class FeedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        following_ids = list(
            Follow.objects.filter(follower=request.user).values_list("following_id", flat=True)
        )

        reviews = (
            Review.objects.filter(user_id__in=following_ids)
            .select_related("user", "book")
            .order_by("-created_at")[:20]
        )
        logs = (
            ReadingLog.objects.filter(user_id__in=following_ids)
            .select_related("user", "book")
            .order_by("-updated_at")[:20]
        )

        feed_items = []

        for review in reviews:
            feed_items.append(
                {
                    "type": "review",
                    "username": review.user.username,
                    "book_id": review.book.id,
                    "book_title": review.book.title,
                    "rating": review.rating,
                    "text": review.text,
                    "timestamp": review.created_at,
                }
            )

        for log in logs:
            feed_items.append(
                {
                    "type": "reading_log",
                    "username": log.user.username,
                    "book_id": log.book.id,
                    "book_title": log.book.title,
                    "status": log.status,
                    "started_at": log.started_at,
                    "finished_at": log.finished_at,
                    "timestamp": log.updated_at,
                }
            )

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

        return Response(
            {
                "finished_books_total": ReadingLog.objects.filter(
                    user=request.user, status="finished"
                ).count(),
                "currently_reading_total": ReadingLog.objects.filter(
                    user=request.user, status="reading"
                ).count(),
                "want_to_read_total": ReadingLog.objects.filter(
                    user=request.user, status="want_to_read"
                ).count(),
                "reviews_total": reviews.count(),
                "average_rating": reviews.aggregate(avg=Avg("rating"))["avg"],
                "top_genre": top_genre["book__genre"] if top_genre else None,
                "public_shelves_total": Shelf.objects.filter(
                    owner=request.user, is_public=True
                )
                .exclude(name=SAVED_SHELF_NAME)
                .count(),
            }
        )


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

        favourite_authors = (
            Review.objects.filter(user=request.user, rating__gte=4)
            .values("book__authors")
            .annotate(total=Count("id"))
            .order_by("-total")
            .values_list("book__authors", flat=True)
        )
        top_author_ids = list(favourite_authors[:3])

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

        recommendation_filter = Q(id__in=socially_popular_book_ids)
        if top_genres:
            recommendation_filter |= Q(genre__in=top_genres)
        if top_author_ids:
            recommendation_filter |= Q(authors__id__in=top_author_ids)

        recommendations = recommendations.filter(recommendation_filter).distinct().prefetch_related("authors")[:12]

        data = []
        for book in recommendations:
            reasons = []
            if book.genre and book.genre in top_genres:
                reasons.append(f"matches your preferred genre: {book.genre}")
            if book.authors.filter(id__in=top_author_ids).exists():
                reasons.append("by an author you have rated highly")
            if book.id in socially_popular_book_ids:
                reasons.append("liked by people you follow")

            serialized = BookSerializer(book).data
            serialized["reasons"] = reasons
            data.append(serialized)

        return Response(data)
