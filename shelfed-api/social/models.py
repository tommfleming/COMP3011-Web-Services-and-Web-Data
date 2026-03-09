from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from books.models import Book


class Shelf(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shelves")
    name = models.CharField(max_length=100)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.owner.username} - {self.name}"


class ShelfItem(models.Model):
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, related_name="items")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="shelf_items")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("shelf", "book")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.shelf.name}: {self.book.title}"


class ReadingLog(models.Model):
    STATUS_CHOICES = [
        ("want_to_read", "Want to Read"),
        ("reading", "Reading"),
        ("finished", "Finished"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reading_logs")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reading_logs")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    started_at = models.DateField(null=True, blank=True)
    finished_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "book")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "book")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} review of {self.book.title}"


class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="following")
    following = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="followers")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.follower.username} -> {self.following.username}"