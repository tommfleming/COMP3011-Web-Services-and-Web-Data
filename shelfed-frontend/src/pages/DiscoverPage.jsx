import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function DiscoverPage() {
    const { isAuthenticated } = useAuth();

    const [filters, setFilters] = useState({
        title: "",
        author: "",
        genre: "",
        year_min: "",
        year_max: "",
    });
    const [filterOptions, setFilterOptions] = useState({
        genres: [],
        min_year: 1900,
        max_year: 2026,
    });

    const [books, setBooks] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("success");
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(isAuthenticated);

    useEffect(() => {
        initialisePage();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setRecommendations([]);
            return;
        }
        fetchRecommendations();
    }, [isAuthenticated]);

    async function initialisePage() {
        setError("");
        setIsLoadingBooks(true);

        try {
            const [bookData, filterData] = await Promise.all([
                api.getBooks(),
                api.getBookFilterOptions(),
            ]);

            setBooks(bookData.results || []);
            setFilterOptions(filterData);

            setFilters((current) => ({
                ...current,
                year_min: filterData.min_year,
                year_max: filterData.max_year,
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingBooks(false);
        }
    }

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
        setNotice("");
        try {
            await api.saveBook(bookId);
            setNoticeType("success");
            setNotice("Saved for later.");
        } catch (err) {
            setNoticeType("error");
            setNotice(err.message);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
    }

    function handleYearMinChange(event) {
        const value = Number(event.target.value);
        setFilters((current) => ({
            ...current,
            year_min: value,
            year_max: Number(current.year_max) < value ? value : current.year_max,
        }));
    }

    function handleYearMaxChange(event) {
        const value = Number(event.target.value);
        setFilters((current) => ({
            ...current,
            year_max: value,
            year_min: Number(current.year_min) > value ? value : current.year_min,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        await fetchBooks();
    }

    async function handleReset() {
        const resetFilters = {
            title: "",
            author: "",
            genre: "",
            year_min: filterOptions.min_year,
            year_max: filterOptions.max_year,
        };
        setFilters(resetFilters);
        await fetchBooks(resetFilters);
    }

    return (
        <section className="page-grid">
            <div className="stack">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Discover</p>
                        <h1>Recommended and searchable books</h1>
                        <p className="muted">
                            Search by title and author, then filter by genre and publication year.
                        </p>
                    </div>
                </div>

                {notice && (
                    <p className={noticeType === "error" ? "form-error" : "form-success"}>
                        {notice}
                    </p>
                )}

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

                <form className="card form-stack" onSubmit={handleSubmit}>
                    <div className="filter-grid filter-grid--discover">
                        <label>
                            Title
                            <input
                                name="title"
                                value={filters.title}
                                onChange={handleChange}
                                placeholder="Dune"
                            />
                        </label>

                        <label>
                            Author
                            <input
                                name="author"
                                value={filters.author}
                                onChange={handleChange}
                                placeholder="Frank Herbert"
                            />
                        </label>

                        <label>
                            Genre
                            <select name="genre" value={filters.genre} onChange={handleChange}>
                                <option value="">All genres</option>
                                {filterOptions.genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="filter-grid__full">
                            <label>
                                Published year range
                                <div className="range-controls">
                                    <div className="range-values">
                                        <span>{filters.year_min || filterOptions.min_year}</span>
                                        <span>{filters.year_max || filterOptions.max_year}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={filterOptions.min_year}
                                        max={filterOptions.max_year}
                                        value={filters.year_min || filterOptions.min_year}
                                        onChange={handleYearMinChange}
                                    />
                                    <input
                                        type="range"
                                        min={filterOptions.min_year}
                                        max={filterOptions.max_year}
                                        value={filters.year_max || filterOptions.max_year}
                                        onChange={handleYearMaxChange}
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="filter-actions">
                            <button className="button" type="submit">
                                Apply filters
                            </button>
                            <button
                                className="button button--ghost"
                                type="button"
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                        </div>
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