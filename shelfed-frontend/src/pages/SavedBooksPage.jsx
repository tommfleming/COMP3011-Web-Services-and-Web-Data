import { useEffect, useState } from "react";
import { api } from "../api/client";
import BookCard from "../components/BookCard";

function SavedBooksPage() {
    const [savedBooks, setSavedBooks] = useState([]);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        loadSavedBooks();
    }, []);

    async function loadSavedBooks() {
        setError("");
        try {
            const data = await api.getSavedBooks();
            setSavedBooks(data || []);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleToggleSave(bookId, isSaved) {
        if (!isSaved) return;

        try {
            await api.removeSavedBook(bookId);
            setSavedBooks((current) => current.filter((book) => book.id !== bookId));
            setNotice("Removed from Saved Books.");
            window.clearTimeout(window.__shelfedSavedPageTimer);
            window.__shelfedSavedPageTimer = window.setTimeout(() => {
                setNotice("");
            }, 2200);
        } catch (err) {
            setNotice(err.message);
            window.clearTimeout(window.__shelfedSavedPageTimer);
            window.__shelfedSavedPageTimer = window.setTimeout(() => {
                setNotice("");
            }, 2200);
        }
    }

    return (
        <section className="page-grid">
            <div className="stack">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">Saved books</p>
                        <h1>Your saved list</h1>
                        <p className="muted">
                            Keep books here for later and remove them whenever you like.
                        </p>
                    </div>
                </div>

                {notice && <p className="inline-toast">{notice}</p>}
                {error && <p className="form-error">{error}</p>}

                {savedBooks.length === 0 ? (
                    <div className="panel">You have not saved any books yet.</div>
                ) : (
                    <div className="book-grid">
                        {savedBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                showSave
                                isSaved
                                onToggleSave={handleToggleSave}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default SavedBooksPage;