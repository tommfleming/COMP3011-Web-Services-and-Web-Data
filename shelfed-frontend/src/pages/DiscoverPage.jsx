import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";

function DiscoverPage() {
    const { isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [filterOptions, setFilterOptions] = useState(null);
    const [filters, setFilters] = useState({
        title: "",
        author: "",
        genre: "",
        year_min: "",
        year_max: "",
    });

    const [books, setBooks] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
    const [error, setError] = useState("");
    const [saveNotice, setSaveNotice] = useState("");

    useEffect(() => {
        loadFilterOptions();
    }, []);

    useEffect(() => {
        if (!filterOptions) return;

        const nextFilters = {
            title: searchParams.get("title") || "",
            author: searchParams.get("author") || "",
            genre: searchParams.get("genre") || "",
            year_min: Number(searchParams.get("year_min") || filterOptions.min_year),
            year_max: Number(searchParams.get("year_max") || filterOptions.max_year),
        };

        setFilters(nextFilters);
        loadBooks(nextFilters);
    }, [filterOptions, searchParams]);

    useEffect(() => {
        if (!isAuthenticated) {
            setRecommendations([]);
            return;
        }
        loadRecommendations();
    }, [isAuthenticated]);

    async function loadFilterOptions() {
        try {
            const data = await api.getBookFilterOptions();
            setFilterOptions(data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function loadBooks(nextFilters) {
        setIsLoadingBooks(true);
        setError("");

        try {
            const data = await api.getBooks(nextFilters);
            setBooks(data.results || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingBooks(false);
        }
    }

    async function loadRecommendations() {
        setIsLoadingRecommendations(true);
        try {
            const data = await api.getRecommendations();
            setRecommendations(data || []);
        } catch (_err) {
            setRecommendations([]);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }

    async function handleSave(bookId) {
        try {
            await api.saveBook(bookId);
            setSaveNotice("Saved to your Saved Books.");
            window.clearTimeout(window.__shelfedSaveTimer);
            window.__shelfedSaveTimer = window.setTimeout(() => {
                setSaveNotice("");
            }, 2200);
        } catch (err) {
            setSaveNotice(err.message);
            window.clearTimeout(window.__shelfedSaveTimer);
            window.__shelfedSaveTimer = window.setTimeout(() => {
                setSaveNotice("");
            }, 2200);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleMinYearChange(event) {
        const nextMin = Number(event.target.value);
        setFilters((current) => ({
            ...current,
            year_min: nextMin,
            year_max: Math.max(Number(current.year_max), nextMin),
        }));
    }

    function handleMaxYearChange(event) {
        const nextMax = Number(event.target.value);
        setFilters((current) => ({
            ...current,
            year_max: nextMax,
            year_min: Math.min(Number(current.year_min), nextMax),
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const nextParams = {};
        if (filters.title) nextParams.title = filters.title;
        if (filters.author) nextParams.author = filters.author;
        if (filters.genre) nextParams.genre = filters.genre;
        if (filterOptions && Number(filters.year_min) !== Number(filterOptions.min_year)) {
            nextParams.year_min = filters.year_min;
        }
        if (filterOptions && Number(filters.year_max) !== Number(filterOptions.max_year)) {
            nextParams.year_max = filters.year_max;
        }

        setSearchParams(nextParams);
    }

    function handleReset() {
        if (!filterOptions) return;
        setSearchParams({});
        setFilters({
            title: "",
            author: "",
            genre: "",
            year_min: filterOptions.min_year,
            year_max: filterOptions.max_year,
        });
    }

    const minYear = filterOptions?.min_year ?? 1900;
    const maxYear = filterOptions?.max_year ?? 2026;
    const selectedMin = Number(filters.year_min || minYear);
    const selectedMax = Number(filters.year_max || maxYear);

    const rangePercentages = useMemo(() => {
        if (maxYear === minYear) {
            return { left: 0, right: 0 };
        }

        const left = ((selectedMin - minYear) / (maxYear - minYear)) * 100;
        const right = 100 - ((selectedMax - minYear) / (maxYear - minYear)) * 100;

        return { left, right };
    }, [selectedMin, selectedMax, minYear, maxYear]);

    return (
        <section className="page-grid">
            <div className="stack">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Discover</p>
                        <h1>Find books you might like</h1>
                        <p className="muted">
                            Recommendations appear first, but you can always keep searching and filtering below.
                        </p>
                    </div>
                </div>

                {saveNotice && <p className="inline-toast">{saveNotice}</p>}
                {error && <p className="form-error">{error}</p>}

                {isAuthenticated && (
                    <div className="stack">
                        <h2>Recommended for you</h2>
                        {isLoadingRecommendations ? (
                            <div className="panel">Loading recommendations…</div>
                        ) : recommendations.length === 0 ? (
                            <div className="panel">
                                You do not have personalised recommendations yet. Rate more books to improve this section.
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
                    <h2>Search and filter</h2>

                    <div className="filter-grid filter-grid--discover">
                        <label>
                            Title
                            <input
                                name="title"
                                value={filters.title}
                                onChange={handleChange}
                                placeholder="Search by title"
                            />
                        </label>

                        <label>
                            Author
                            <input
                                name="author"
                                value={filters.author}
                                onChange={handleChange}
                                placeholder="Search by author"
                            />
                        </label>

                        <label>
                            Genre
                            <select name="genre" value={filters.genre} onChange={handleChange}>
                                <option value="">All genres</option>
                                {(filterOptions?.genres || []).map((genre) => (
                                    <option key={genre} value={genre}>
                                        {genre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="filter-grid__full">
                            <span className="label-heading">Published year</span>
                            <div className="range-values">
                                <span>{selectedMin}</span>
                                <span>{selectedMax}</span>
                            </div>

                            <div className="dual-range">
                                <div className="dual-range__track" />
                                <div
                                    className="dual-range__selected"
                                    style={{
                                        left: `${rangePercentages.left}%`,
                                        right: `${rangePercentages.right}%`,
                                    }}
                                />
                                <input
                                    className="dual-range__input"
                                    type="range"
                                    min={minYear}
                                    max={maxYear}
                                    value={selectedMin}
                                    onChange={handleMinYearChange}
                                />
                                <input
                                    className="dual-range__input"
                                    type="range"
                                    min={minYear}
                                    max={maxYear}
                                    value={selectedMax}
                                    onChange={handleMaxYearChange}
                                />
                            </div>
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