import { Link, useLocation } from "react-router-dom";

function BookCard({ book, showSave = false, onSave }) {
    const location = useLocation();
    const from = `${location.pathname}${location.search}`;

    function handleSave(event) {
        event.preventDefault();
        event.stopPropagation();
        if (onSave) {
            onSave(book.id);
        }
    }

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

                    {book.reasons?.length > 0 && (
                        <ul className="reasons-list">
                            {book.reasons.map((reason) => (
                                <li key={reason}>{reason}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </Link>

            {showSave && (
                <div className="book-card__actions">
                    <button className="button button--ghost" type="button" onClick={handleSave}>
                        Save
                    </button>
                </div>
            )}
        </article>
    );
}

export default BookCard;