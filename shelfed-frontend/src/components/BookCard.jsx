import { Link } from "react-router-dom";

function BookCard({
  book,
  onSave,
  onRemove,
  onAddToShelf,
  shelves = [],
  showSave = false,
  showRemove = false,
  showShelfSelect = false,
}) {
  return (
    <article className="card book-card">
      <div className="book-card__cover">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} />
        ) : (
          <div className="cover-placeholder">No cover</div>
        )}
      </div>

      <div className="book-card__content">
        <h3>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="muted">
          {book.authors?.map((author) => author.name).join(", ") || "Unknown author"}
        </p>
        {book.genre && <p className="badge">{book.genre}</p>}
        {book.description && (
          <p className="book-card__description">{book.description.slice(0, 150)}{book.description.length > 150 ? "…" : ""}</p>
        )}

        <div className="book-card__actions">
          {showSave && (
            <button className="button button--ghost" onClick={() => onSave?.(book.id)}>
              Save later
            </button>
          )}
          {showRemove && (
            <button className="button button--danger" onClick={() => onRemove?.(book.id)}>
              Remove
            </button>
          )}
          {showShelfSelect && shelves.length > 0 && (
            <select
              className="select"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) {
                  onAddToShelf?.(event.target.value, book.id);
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
      </div>
    </article>
  );
}

export default BookCard;
