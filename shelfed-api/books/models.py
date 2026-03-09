from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Book(models.Model):
    SOURCE_CHOICES = [
        ("openlibrary", "Open Library"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    published_year = models.IntegerField(null=True, blank=True)

    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default="openlibrary")
    external_id = models.CharField(max_length=100, unique=True, null=True, blank=True)

    authors = models.ManyToManyField(Author, related_name="books")
    genre = models.CharField(max_length=100, blank=True)
    cover_url = models.URLField(blank=True)
    isbn13 = models.CharField(max_length=13, null=True, blank=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title