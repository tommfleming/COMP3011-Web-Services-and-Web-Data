import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { api } from "../api/client";

function SavedBooksPage() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSavedBooks();
  }, []);

  async function loadSavedBooks() {
    setError("");
    try {
      const data = await api.getSavedBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(bookId) {
    try {
      await api.removeSavedBook(bookId);
      setBooks((current) => current.filter((book) => book.id !== bookId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="page-grid">
      <div className="stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Saved books</p>
            <h1>Books you want to come back to</h1>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {books.length === 0 ? (
          <div className="panel">You have not saved any books yet.</div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showRemove
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SavedBooksPage;
