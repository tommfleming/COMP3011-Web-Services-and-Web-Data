import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReviewCard from "../components/ReviewCard";

function BookDetailPage() {
    const { bookId } = useParams();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const backTarget = location.state?.from || "/discover";

    useEffect(() => {
        loadPage();
    }, [bookId, isAuthenticated]);

    async function loadPage() {
        setError("");
        try {
            const [bookData, reviewData] = await Promise.all([
                api.getBook(bookId),
                api.getBookReviews(bookId),
            ]);
            setBook(bookData);
            setReviews(reviewData.results || []);

            if (isAuthenticated) {
                const shelfData = await api.getShelves();
                setShelves((shelfData.results || []).filter((shelf) => shelf.name !== "Saved for Later"));
            } else {
                setShelves([]);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSave() {
        setNotice("");
        try {
            await api.saveBook(book.id);
            setNotice("Saved to your Saved Books.");
        } catch (err) {
            setNotice(err.message);
        }
    }

    async function handleAddToShelf(shelfId) {
        setNotice("");
        try {
            await api.addBookToShelf(shelfId, book.id);
            setNotice("Book added to shelf.");
        } catch (err) {
            setNotice(err.message);
        }
    }

    if (error) {
        return <div className="panel form-error">{error}</div>;
    }

    if (!book) {
        return <div className="panel">Loading book details…</div>;
    }

    return (
        <section className="page-grid">
            <div className="stack">
                <div className="button-row">
                    <Link className="button button--ghost" to={backTarget}>
                        Back to results
                    </Link>
                </div>

                <div className="book-detail card">
                    <div className="book-detail__cover">
                        {book.cover_url ? (
                            <img src={book.cover_url} alt={`${book.title} cover`} />
                        ) : (
                            <div className="cover-placeholder cover-placeholder--large">No cover</div>
                        )}
                    </div>

                    <div className="book-detail__content">
                        <p className="eyebrow">Book details</p>
                        <h1>{book.title}</h1>
                        <p className="muted">
                            {book.authors?.map((author) => author.name).join(", ") || "Unknown author"}
                        </p>

                        <div className="button-row">
                            {book.genre && <span className="badge">{book.genre}</span>}
                            {book.published_year && <span className="badge">{book.published_year}</span>}
                        </div>

                        {notice && <p className="form-success">{notice}</p>}

                        <p>
                            {book.description ||
                                "No description is currently available for this title in the catalogue."}
                        </p>

                        {isAuthenticated && (
                            <div className="button-row">
                                <button className="button button--ghost" type="button" onClick={handleSave}>
                                    Save
                                </button>

                                {shelves.length > 0 && (
                                    <select
                                        className="select"
                                        defaultValue=""
                                        onChange={(event) => {
                                            if (event.target.value) {
                                                handleAddToShelf(event.target.value);
                                                event.target.value = "";
                                            }
                                        }}
                                    >
                                        <option value="" disabled>
                                            Add to shelf…
                                        </option>
                                        {shelves.map((shelf) => (
                                            <option key={shelf.id} value={shelf.id}>
                                                {shelf.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="stack">
                    <h2>Reader reviews</h2>
                    {reviews.length === 0 ? (
                        <div className="panel">No reviews yet for this book.</div>
                    ) : (
                        reviews.map((review) => <ReviewCard key={review.id} review={review} />)
                    )}
                </div>
            </div>
        </section>
    );
}

export default BookDetailPage;