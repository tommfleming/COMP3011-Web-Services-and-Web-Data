import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function DiscoverPage() {
  const { isAuthenticated } = useAuth();

  const [filters, setFilters] = useState({
    q: "",
    genre: "",
    author: "",
  });
  const [books, setBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(isAuthenticated);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendations([]);
      return;
    }
    fetchRecommendations();
  }, [isAuthenticated]);

  async function fetchBooks(customFilters = filters) {
    setError("");
    setIsLoadingBooks(true);
    try {
      const data = await api.getBooks(customFilters);
      setBooks(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingBooks(false);
    }
  }

  async function fetchRecommendations() {
    setIsLoadingRecommendations(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (_err) {
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }

  async function handleSave(bookId) {
    try {
      await api.saveBook(bookId);
      alert("Saved for later.");
    } catch (err) {
      alert(err.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await fetchBooks();
  }

  return (
    <section className="page-grid">
      <div className="stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Discover</p>
            <h1>Recommended and searchable books</h1>
            <p className="muted">
              Browse your catalogue, search by title, and filter by genre or author.
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="stack">
            <h2>Recommended for you</h2>
            {isLoadingRecommendations ? (
              <div className="panel">Loading recommendations…</div>
            ) : recommendations.length === 0 ? (
              <div className="panel">
                No personalised recommendations yet. Add a few ratings or follow some readers.
              </div>
            ) : (
              <div className="book-grid">
                {recommendations.map((book) => (
                  <BookCard
                    key={`recommended-${book.id}`}
                    book={book}
                    showSave
                    onSave={handleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <form className="card filter-grid" onSubmit={handleSubmit}>
          <label>
            Search
            <input
              name="q"
              value={filters.q}
              onChange={handleChange}
              placeholder="Book title or author"
            />
          </label>
          <label>
            Genre
            <input
              name="genre"
              value={filters.genre}
              onChange={handleChange}
              placeholder="Fantasy"
            />
          </label>
          <label>
            Author
            <input
              name="author"
              value={filters.author}
              onChange={handleChange}
              placeholder="Jane Austen"
            />
          </label>
          <div className="filter-actions">
            <button className="button" type="submit">
              Search
            </button>
          </div>
        </form>

        {error && <p className="form-error">{error}</p>}

        {isLoadingBooks ? (
          <div className="panel">Loading books…</div>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showSave={isAuthenticated}
                onSave={handleSave}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DiscoverPage;
