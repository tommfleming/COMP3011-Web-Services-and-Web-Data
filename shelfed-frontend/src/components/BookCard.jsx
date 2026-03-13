import { Link, useLocation } from "react-router-dom";

function BookCard({ book, showSave = false, isSaved = false, onToggleSave }) {
    const location = useLocation();
    const from = `${location.pathname}${location.search}`;

    function handleToggleSave(event) {
        event.preventDefault();
        event.stopPropagation();

        if (onToggleSave) {
            onToggleSave(book.id, isSaved);
        }
    }

    const recommendationHint =
        book.reasons?.length > 0 ? book.reasons.join(" • ") : "";

    return (
        <article className="book-card card">
            <Link
                className="book-card__link"
                to={`/books/${book.id}`}
                state={{ from }}
            >
                {book.cover_url ? (
                    <img
                        className="book-card__cover"
                        src={book.cover_url}
                        alt={`${book.title} cover`}
                    />
                ) : (
                    <div className="cover-placeholder">No cover</div>
                )}

                <div className="book-card__content">
                    <h3>{book.title}</h3>
                    <p className="muted">
                        {book.authors?.map((author) => author.name).join(", ") || "Unknown author"}
                    </p>

                    <div className="button-row">
                        {book.genre && <span className="badge">{book.genre}</span>}
                        {book.published_year && <span className="badge">{book.published_year}</span>}
                    </div>
                </div>
            </Link>

            {showSave && (
                <div className="book-card__actions">
                    <button
                        className="button button--ghost"
                        type="button"
                        onClick={handleToggleSave}
                    >
                        {isSaved ? "Unsave" : "Save"}
                    </button>

                    {recommendationHint && (
                        <div className="tooltip">
                            <button
                                type="button"
                                className="book-card__hint"
                                aria-label="Why this book was recommended"
                                onClick={(event) => event.preventDefault()}
                            >
                                ?
                            </button>
                            <div className="tooltip__bubble">{recommendationHint}</div>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

export default BookCard;