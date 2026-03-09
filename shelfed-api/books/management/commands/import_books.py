import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand

from books.models import Author, Book


TOPIC_QUERIES = {
    "Science Fiction": "science fiction",
    "Fantasy": "fantasy",
    "Mystery": "mystery",
    "Classics": "classic literature",
    "Romance": "romance novels",
    "Non-Fiction": "popular science",
}


class Command(BaseCommand):
    help = "Import a starter catalogue of books from Open Library."

    def add_arguments(self, parser):
        parser.add_argument(
            "--per-query",
            type=int,
            default=20,
            help="How many books to import for each topic query.",
        )

    def handle(self, *args, **options):
        per_query = options["per_query"]

        total_created = 0
        total_updated = 0

        for genre, query in TOPIC_QUERIES.items():
            self.stdout.write(self.style.NOTICE(f"Importing query: {query}"))

            params = {
                "q": query,
                "fields": "key,title,author_name,first_publish_year,cover_i,isbn",
                "limit": per_query,
                "page": 1,
            }

            url = f"https://openlibrary.org/search.json?{urlencode(params)}"
            request = Request(
                url,
                headers={
                    "User-Agent": "Shelfed/0.1 (twfleming@btinternet.com)"
                },
            )

            with urlopen(request, timeout=20) as response:
                payload = json.loads(response.read().decode("utf-8"))

            docs = payload.get("docs", [])

            for doc in docs:
                title = doc.get("title")
                key = doc.get("key")
                author_names = doc.get("author_name", [])

                if not title or not key or not author_names:
                    continue

                external_id = key.split("/")[-1]
                first_publish_year = doc.get("first_publish_year")
                cover_i = doc.get("cover_i")
                isbn_values = doc.get("isbn", [])

                isbn13 = None
                for value in isbn_values:
                    if len(value) == 13 and value.isdigit():
                        isbn13 = value
                        break

                cover_url = ""
                if cover_i:
                    cover_url = f"https://covers.openlibrary.org/b/id/{cover_i}-M.jpg"

                book, created = Book.objects.get_or_create(
                    external_id=external_id,
                    defaults={
                        "title": title[:255],
                        "published_year": first_publish_year,
                        "genre": genre,
                        "source": "openlibrary",
                        "cover_url": cover_url,
                        "isbn13": isbn13,
                    },
                )

                if created:
                    total_created += 1
                else:
                    changed = False

                    if not book.genre:
                        book.genre = genre
                        changed = True

                    if not book.cover_url and cover_url:
                        book.cover_url = cover_url
                        changed = True

                    if not book.published_year and first_publish_year:
                        book.published_year = first_publish_year
                        changed = True

                    if not book.isbn13 and isbn13:
                        book.isbn13 = isbn13
                        changed = True

                    if changed:
                        book.save()
                        total_updated += 1

                for author_name in author_names[:3]:
                    author, _ = Author.objects.get_or_create(name=author_name[:255])
                    book.authors.add(author)

        self.stdout.write(
            self.style.SUCCESS(
                f"Import complete. Created={total_created}, Updated={total_updated}"
            )
        )