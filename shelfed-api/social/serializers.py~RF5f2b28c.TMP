from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Follow, ReadingLog, Review, Shelf, ShelfItem
from books.models import Book
from books.serializers import BookSerializer

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


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
        read_only_fields = ["id", "book", "added_at"]


class ShelfSerializer(serializers.ModelSerializer):
    owner = SimpleUserSerializer(read_only=True)
    items = ShelfItemSerializer(many=True, read_only=True)

    class Meta:
        model = Shelf
        fields = ["id", "owner", "name", "is_public", "created_at", "items"]
        read_only_fields = ["owner", "created_at", "items"]


class ReadingLogSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source="book",
        write_only=True,
        required=False,
    )

    class Meta:
        model = ReadingLog
        fields = [
            "id",
            "book",
            "book_id",
            "status",
            "started_at",
            "finished_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "book"]

    def validate(self, attrs):
        request = self.context["request"]

        book = attrs.get("book")
        if book is None and self.instance is not None:
            book = self.instance.book

        if book is None:
            raise serializers.ValidationError({"book_id": "This field is required."})

        queryset = ReadingLog.objects.filter(user=request.user, book=book)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {"book_id": "You already have a reading log for this book."}
            )

        return attrs


class ReviewSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(),
        source="book",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Review
        fields = ["id", "user", "book", "book_id", "rating", "text", "created_at"]
        read_only_fields = ["user", "book", "created_at"]

    def validate(self, attrs):
        request = self.context["request"]

        book = attrs.get("book")
        if book is None and self.instance is not None:
            book = self.instance.book

        if book is None:
            raise serializers.ValidationError({"book_id": "This field is required."})

        queryset = Review.objects.filter(user=request.user, book=book)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                {"book_id": "You have already reviewed this book."}
            )

        return attrs


class FollowSerializer(serializers.ModelSerializer):
    follower = SimpleUserSerializer(read_only=True)
    following = SimpleUserSerializer(read_only=True)
    following_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="following",
        write_only=True,
    )

    class Meta:
        model = Follow
        fields = ["id", "follower", "following", "following_id", "created_at"]
        read_only_fields = ["id", "follower", "following", "created_at"]

    def validate(self, attrs):
        request = self.context["request"]
        following = attrs["following"]

        if request.user == following:
            raise serializers.ValidationError("You cannot follow yourself.")

        if Follow.objects.filter(follower=request.user, following=following).exists():
            raise serializers.ValidationError("You already follow this user.")

        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
