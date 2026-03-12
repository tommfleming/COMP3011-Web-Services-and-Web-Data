import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReviewCard from "../components/ReviewCard";

function BookDetailPage() {
    const { bookId } = useParams();
    const { isAuthenticated } = useAuth();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [shelves, setShelves] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("success");

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
            setNoticeType("success");
            setNotice("Saved for later.");
        } catch (err) {
            setNoticeType("error");
            setNotice(err.message);
        }
    }

    async function handleAddToShelf(shelfId, selectedBookId) {
        setNotice("");
        try {
            await api.addBookToShelf(shelfId, selectedBookId);
            setNoticeType("success");
            setNotice("Book added to shelf.");
            await loadPage();
        } catch (err) {
            setNoticeType("error");
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
            <div className="book-detail card">
                <div className="book-detail__cover">
                    {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} />
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

                    {notice && (
                        <p className={noticeType === "error" ? "form-error" : "form-success"}>
                            {notice}
                        </p>
                    )}

                    <div className="button-row">
                        {book.genre && <span className="badge">{book.genre}</span>}
                        {book.published_year && <span className="badge">{book.published_year}</span>}
                    </div>

                    <p>
                        {book.description || "No description is currently available for this title in the local catalogue."}
                    </p>

                    {isAuthenticated && (
                        <div className="button-row">
                            <button className="button button--ghost" onClick={handleSave}>
                                Save later
                            </button>
                            {shelves.length > 0 && (
                                <select
                                    className="select"
                                    defaultValue=""
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            handleAddToShelf(event.target.value, book.id);
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
        </section>
    );
}

export default BookDetailPage;