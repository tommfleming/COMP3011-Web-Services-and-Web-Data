import uuid
from string import capwords

from rest_framework import serializers

from .models import Author, Book


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name"]


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "description",
            "published_year",
            "source",
            "external_id",
            "genre",
            "cover_url",
            "isbn13",
            "authors",
        ]


class BookCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    author_names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        allow_empty=False,
        write_only=True,
    )
    genre = serializers.CharField(max_length=100, allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    published_year = serializers.IntegerField(required=False, allow_null=True)

    def validate_title(self, value):
        return capwords(" ".join(value.strip().split()))

    def validate_author_names(self, value):
        authors = [capwords(" ".join(name.strip().split())) for name in value if name.strip()]
        if not authors:
            raise serializers.ValidationError("At least one author is required.")
        return authors

    def validate(self, attrs):
        title = attrs["title"]
        authors = attrs["author_names"]

        duplicate_qs = Book.objects.filter(title__iexact=title)
        if authors:
            duplicate_qs = duplicate_qs.filter(authors__name__iexact=authors[0])

        if duplicate_qs.exists():
            raise serializers.ValidationError(
                {"title": "A matching book already exists in the catalogue."}
            )

        return attrs

    def create(self, validated_data):
        author_names = validated_data.pop("author_names")

        book = Book.objects.create(
            source="manual",
            external_id=f"manual-{uuid.uuid4().hex[:12]}",
            **validated_data,
        )

        for author_name in author_names:
            author, _ = Author.objects.get_or_create(name=author_name)
            book.authors.add(author)

        return book

    def to_representation(self, instance):
        return BookSerializer(instance).data
