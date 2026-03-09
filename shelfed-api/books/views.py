from rest_framework import generics
from django.db.models import Q
from rest_framework import generics
from .models import Book
from .serializers import BookSerializer


class BookListView(generics.ListAPIView):
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.prefetch_related("authors").all()

        query = self.request.query_params.get("q")
        genre = self.request.query_params.get("genre")

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(authors__name__icontains=query)
            ).distinct()

        if genre:
            queryset = queryset.filter(genre__iexact=genre)

        return queryset


class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.prefetch_related("authors").all()
    serializer_class = BookSerializer