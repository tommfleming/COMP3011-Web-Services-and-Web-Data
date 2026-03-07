from rest_framework import serializers
from .models import Shelf, ShelfItem, ReadingLog, Review, Follow


class ShelfSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelf
        fields = ["id", "owner", "name", "is_public", "created_at"]
        read_only_fields = ["owner", "created_at"]


class ShelfItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShelfItem
        fields = ["id", "shelf", "book", "added_at"]
        read_only_fields = ["added_at"]


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