Add tests similar to these once the backend files are copied in:

- create manual book with `POST /api/books/create/`
- reject duplicate manual book
- save a book for later and list saved books
- remove saved book
- return mutual friends and one-way follows
- include recent reads on public profile and current profile

You can either add these to your existing test files or create:
- `books/tests/test_book_create.py`
- `social/tests/test_saved_books.py`
- `social/tests/test_friends.py`
- `social/tests/test_profile.py`
