from django.db.models import Max, Min, Q

from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book
from .serializers import BookCreateSerializer, BookSerializer
from social.models import Review
from social.serializers import ReviewSerializer


class BookPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = "page_size"
    max_page_size = 500


class BookListView(generics.ListAPIView):
    serializer_class = BookSerializer
    pagination_class = BookPagination

    def get_queryset(self):
        queryset = Book.objects.prefetch_related("authors").all()

        query = self.request.query_params.get("q")
        title = self.request.query_params.get("title")
        author = self.request.query_params.get("author")
        genre = self.request.query_params.get("genre")
        year_min = self.request.query_params.get("year_min")
        year_max = self.request.query_params.get("year_max")

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(authors__name__icontains=query)
            ).distinct()

        if title:
            queryset = queryset.filter(title__icontains=title)

        if author:
            queryset = queryset.filter(authors__name__icontains=author).distinct()

        if genre:
            queryset = queryset.filter(genre__iexact=genre)

        if year_min:
            try:
                queryset = queryset.filter(published_year__gte=int(year_min))
            except (TypeError, ValueError):
                pass

        if year_max:
            try:
                queryset = queryset.filter(published_year__lte=int(year_max))
            except (TypeError, ValueError):
                pass

        return queryset.distinct().order_by("title", "id")


class BookFilterOptionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        genres = list(
            Book.objects.exclude(genre__isnull=True)
            .exclude(genre__exact="")
            .values_list("genre", flat=True)
            .distinct()
            .order_by("genre")
        )

        year_stats = Book.objects.exclude(published_year__isnull=True).aggregate(
            min_year=Min("published_year"),
            max_year=Max("published_year"),
        )

        min_year_raw = year_stats["min_year"]
        min_year = (min_year_raw // 10) * 10
        max_year = 2026

        return Response(
            {
                "genres": genres,
                "min_year": min_year,
                "max_year": max_year,
            }
        )


class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.prefetch_related("authors").all()
    serializer_class = BookSerializer


class BookReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        return (
            Review.objects.filter(book_id=self.kwargs["book_id"])
            .select_related("user", "book")
            .order_by("-created_at")
        )


class BookCreateView(generics.CreateAPIView):
    serializer_class = BookCreateSerializer
    permission_classes = [permissions.IsAuthenticated]