import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

function titleCase(value) {
    return value
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function LogBookPage() {
    const [search, setSearch] = useState("");
    const [existingBooks, setExistingBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);

    const [newBook, setNewBook] = useState({
        title: "",
        author: "",
        genre: "",
        description: "",
        published_year: "",
    });

    const [logForm, setLogForm] = useState({
        status: "finished",
        rating: "",
        review: "",
        finished_at: "",
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (search.trim().length < 2) {
            setExistingBooks([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const data = await api.getBooks({ q: search });
                setExistingBooks(data.results || []);
            } catch (_err) {
                setExistingBooks([]);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const duplicateMatch = useMemo(() => {
        const title = titleCase(newBook.title || "");
        const author = titleCase(newBook.author || "");

        return existingBooks.find((book) => {
            const sameTitle = book.title.toLowerCase() === title.toLowerCase();
            const sameAuthor = book.authors?.some(
                (item) => item.name.toLowerCase() === author.toLowerCase()
            );
            return sameTitle && sameAuthor;
        });
    }, [existingBooks, newBook.title, newBook.author]);

    function handleStatusChange(value) {
        if (value === "finished") {
            setLogForm((current) => ({ ...current, status: value }));
            return;
        }

        setLogForm((current) => ({
            ...current,
            status: value,
            rating: "",
            review: "",
            finished_at: "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setGeneralError("");
        setSuccess("");
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            let bookId = selectedBook?.id;

            if (!bookId) {
                const nextErrors = {};

                if (!newBook.title.trim()) nextErrors.title = "Please enter a title.";
                if (!newBook.author.trim()) nextErrors.author = "Please enter an author.";

                if (Object.keys(nextErrors).length > 0) {
                    setFieldErrors(nextErrors);
                    return;
                }

                if (duplicateMatch) {
                    setFieldErrors({
                        title: "A matching book already exists. Select it from the search results instead.",
                    });
                    return;
                }

                const createdBook = await api.createBook({
                    title: newBook.title,
                    author_names: [newBook.author],
                    genre: newBook.genre,
                    description: newBook.description,
                    published_year: newBook.published_year ? Number(newBook.published_year) : null,
                });

                bookId = createdBook.id;
            }

            const logPayload = {
                book_id: bookId,
                status: logForm.status,
            };

            if (logForm.status === "finished") {
                if (!logForm.finished_at) {
                    setFieldErrors({ finished_at: "Please add a finished date." });
                    return;
                }
                if (!logForm.rating) {
                    setFieldErrors({ rating: "A rating is required for finished books." });
                    return;
                }
                logPayload.finished_at = logForm.finished_at;
            }

            await api.createReadingLog(logPayload);

            if (logForm.status === "finished") {
                await api.createReview({
                    book_id: bookId,
                    rating: Number(logForm.rating),
                    text: logForm.review,
                });
            }

            setSuccess("Your reading update has been saved.");
            setSelectedBook(null);
            setSearch("");
            setExistingBooks([]);
            setNewBook({
                title: "",
                author: "",
                genre: "",
                description: "",
                published_year: "",
            });
            setLogForm({
                status: "finished",
                rating: "",
                review: "",
                finished_at: "",
            });
        } catch (err) {
            if (err.fields && Object.keys(err.fields).length > 0) {
                setFieldErrors(err.fields);
            } else {
                setGeneralError(err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const showFinishedFields = logForm.status === "finished";

    return (
        <section className="page-grid page-grid--two-column">
            <div className="stack">
                <div className="card form-stack">
                    <h1>Log a book</h1>
                    <p className="muted">
                        Search the catalogue first. If the book does not exist, add it below.
                    </p>

                    <label>
                        Search existing books
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setSelectedBook(null);
                            }}
                            placeholder="Start typing a title or author"
                        />
                    </label>

                    {existingBooks.length > 0 && (
                        <div className="results-list">
                            {existingBooks.map((book) => (
                                <button
                                    type="button"
                                    className={`result-button ${selectedBook?.id === book.id ? "result-button--active" : ""}`}
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                >
                                    {book.title} — {book.authors?.map((author) => author.name).join(", ")}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <form className="card form-stack" onSubmit={handleSubmit}>
                    <h2>{selectedBook ? "Using selected catalogue book" : "Add a new catalogue book"}</h2>

                    {selectedBook ? (
                        <div className="panel">
                            <strong>{selectedBook.title}</strong>
                            <p className="muted">
                                {selectedBook.authors?.map((author) => author.name).join(", ")}
                            </p>
                        </div>
                    ) : (
                        <>
                            <label>
                                Title
                                <input
                                    value={newBook.title}
                                    onChange={(event) =>
                                        setNewBook((current) => ({ ...current, title: event.target.value }))
                                    }
                                    onBlur={(event) =>
                                        setNewBook((current) => ({ ...current, title: titleCase(event.target.value) }))
                                    }
                                />
                                {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
                            </label>

                            <label>
                                Author
                                <input
                                    value={newBook.author}
                                    onChange={(event) =>
                                        setNewBook((current) => ({ ...current, author: event.target.value }))
                                    }
                                    onBlur={(event) =>
                                        setNewBook((current) => ({ ...current, author: titleCase(event.target.value) }))
                                    }
                                />
                                {fieldErrors.author && <p className="field-error">{fieldErrors.author}</p>}
                            </label>

                            <label>
                                Genre
                                <input
                                    value={newBook.genre}
                                    onChange={(event) =>
                                        setNewBook((current) => ({ ...current, genre: event.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Published year
                                <input
                                    type="number"
                                    value={newBook.published_year}
                                    onChange={(event) =>
                                        setNewBook((current) => ({ ...current, published_year: event.target.value }))
                                    }
                                />
                            </label>

                            <label>
                                Description
                                <textarea
                                    rows="4"
                                    value={newBook.description}
                                    onChange={(event) =>
                                        setNewBook((current) => ({ ...current, description: event.target.value }))
                                    }
                                />
                            </label>
                        </>
                    )}

                    <label>
                        Reading status
                        <select
                            value={logForm.status}
                            onChange={(event) => handleStatusChange(event.target.value)}
                        >
                            <option value="want_to_read">Want to read</option>
                            <option value="reading">Reading</option>
                            <option value="finished">Finished</option>
                        </select>
                    </label>

                    {showFinishedFields && (
                        <>
                            <label>
                                Finished on
                                <input
                                    type="date"
                                    value={logForm.finished_at}
                                    onChange={(event) =>
                                        setLogForm((current) => ({ ...current, finished_at: event.target.value }))
                                    }
                                />
                                {fieldErrors.finished_at && (
                                    <p className="field-error">{fieldErrors.finished_at}</p>
                                )}
                            </label>

                            <label>
                                Rating (required)
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={logForm.rating}
                                    onChange={(event) =>
                                        setLogForm((current) => ({ ...current, rating: event.target.value }))
                                    }
                                />
                                {fieldErrors.rating && <p className="field-error">{fieldErrors.rating}</p>}
                            </label>

                            <label>
                                Review (optional)
                                <textarea
                                    rows="5"
                                    value={logForm.review}
                                    onChange={(event) =>
                                        setLogForm((current) => ({ ...current, review: event.target.value }))
                                    }
                                />
                            </label>
                        </>
                    )}

                    {generalError && <p className="form-error">{generalError}</p>}
                    {success && <p className="form-success">{success}</p>}

                    <button className="button" disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Saving…" : "Save reading entry"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default LogBookPage;