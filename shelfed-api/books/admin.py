from django.contrib import admin
from .models import Author, Book


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ["title", "published_year", "genre", "source"]
    search_fields = ["title", "genre", "external_id", "isbn13"]
    filter_horizontal = ["authors"]