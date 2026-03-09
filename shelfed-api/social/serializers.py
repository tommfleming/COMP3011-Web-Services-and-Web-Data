from rest_framework import serializers
from .models import Shelf, ShelfItem, ReadingLog, Review, Follow
from books.models import Book
from books.serializers import BookSerializer


class ShelfItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source="book",
        write_only=True,
    )

    class Meta:
        model = ShelfItem
        fields = ["id", "book", "book_id", "added_at"]
        read_only_fields = ["id", "added_at", "book"]


class ShelfSerializer(serializers.ModelSerializer):
    items = ShelfItemSerializer(many=True, read_only=True)

    class Meta:
        model = Shelf
        fields = ["id", "owner", "name", "is_public", "created_at", "items"]
        read_only_fields = ["owner", "created_at", "items"]


class ReadingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingLog
        fields = ["id", "user", "book", "status", "started_at", "finished_at"]
        read_only_fields = ["user"]


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "user", "book", "rating", "text", "created_at"]
        read_only_fields = ["user", "created_at"]


class FollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ["id", "follower", "following", "created_at"]
        read_only_fields = ["follower", "created_at"]