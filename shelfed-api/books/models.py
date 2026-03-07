from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    published_year = models.IntegerField(null=True, blank=True)
    external_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    authors = models.ManyToManyField(Author, related_name="books")
    genre = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title