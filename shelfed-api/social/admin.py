from django.contrib import admin
from .models import Shelf, ShelfItem, ReadingLog, Review, Follow


@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "is_public", "created_at"]
    search_fields = ["name", "owner__username"]


@admin.register(ShelfItem)
class ShelfItemAdmin(admin.ModelAdmin):
    list_display = ["shelf", "book", "added_at"]


@admin.register(ReadingLog)
class ReadingLogAdmin(admin.ModelAdmin):
    list_display = ["user", "book", "status", "started_at", "finished_at"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "book", "rating", "created_at"]


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ["follower", "following", "created_at"]