import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ShelfEditor from "../components/ShelfEditor";

function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isCreatingShelf, setIsCreatingShelf] = useState(false);
    const [finishTargetId, setFinishTargetId] = useState(null);
    const [finishForm, setFinishForm] = useState({
        finished_at: "",
        rating: "",
        review: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        setError("");
        try {
            const data = await api.getMyProfile();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleCreateShelf(payload) {
        setIsCreatingShelf(true);
        setError("");
        setSuccess("");
        try {
            await api.createShelf(payload);
            setSuccess("Shelf created.");
            await loadProfile();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreatingShelf(false);
        }
    }

    async function handleToggleShelf(shelf) {
        setError("");
        setSuccess("");
        try {
            await api.updateShelf(shelf.id, { is_public: !shelf.is_public });
            setSuccess("Shelf visibility updated.");
            await loadProfile();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleRemoveReadingLog(logId) {
        setError("");
        setSuccess("");
        try {
            await api.deleteReadingLog(logId);
            setSuccess("Reading log removed.");
            await loadProfile();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleFinishBook(logId) {
        setError("");
        setSuccess("");

        if (!finishForm.finished_at) {
            setError("Please choose a finished date.");
            return;
        }

        if (!finishForm.rating) {
            setError("Please add a rating when finishing a book.");
            return;
        }

        try {
            await api.finishReading(logId, {
                finished_at: finishForm.finished_at,
                rating: Number(finishForm.rating),
                text: finishForm.review,
            });

            setFinishTargetId(null);
            setFinishForm({
                finished_at: "",
                rating: "",
                review: "",
            });

            setSuccess("Book marked as finished.");
            await loadProfile();
        } catch (err) {
            setError(err.message);
        }
    }

    if (error && !profile) {
        return <div className="panel form-error">{error}</div>;
    }

    if (!profile) {
        return <div className="panel">Loading your profile…</div>;
    }

    const shelves = profile.shelves || [];
    const recentReads = profile.recent_reads || [];
    const currentlyReading = profile.currently_reading || [];

    return (
        <section className="page-grid page-grid--two-column">
            <div className="stack">
                <div className="card">
                    <p className="eyebrow">My profile</p>
                    <h1>{profile.user.username}</h1>
                    <p className="muted">{profile.user.email}</p>

                    <div className="stats-grid">
                        <div className="stat"><strong>{profile.stats.reviews}</strong><span>Reviews</span></div>
                        <div className="stat"><strong>{profile.stats.followers}</strong><span>Followers</span></div>
                        <div className="stat"><strong>{profile.stats.following}</strong><span>Following</span></div>
                        <div className="stat"><strong>{profile.stats.saved_books}</strong><span>Saved books</span></div>
                    </div>
                </div>

                {error && <p className="form-error">{error}</p>}
                {success && <p className="form-success">{success}</p>}

                <div className="stack">
                    <h2>Currently reading</h2>
                    {currentlyReading.length === 0 ? (
                        <div className="panel">You are not currently reading any books.</div>
                    ) : (
                        currentlyReading.map((log) => (
                            <article className="card profile-reading-card" key={log.id}>
                                <h3>
                                    <Link to={`/books/${log.book.id}`}>{log.book.title}</Link>
                                </h3>
                                <p className="muted">
                                    {log.book.authors?.map((author) => author.name).join(", ")}
                                </p>
                                <div className="button-row">
                                    <span className="badge">{log.status}</span>
                                    <button
                                        className="button button--ghost"
                                        type="button"
                                        onClick={() => handleRemoveReadingLog(log.id)}
                                    >
                                        Remove
                                    </button>
                                    <button
                                        className="button"
                                        type="button"
                                        onClick={() => {
                                            setFinishTargetId(log.id);
                                            setFinishForm({
                                                finished_at: "",
                                                rating: "",
                                                review: "",
                                            });
                                        }}
                                    >
                                        Finish
                                    </button>
                                </div>

                                {finishTargetId === log.id && (
                                    <div className="inline-form">
                                        <label>
                                            Finished date
                                            <input
                                                type="date"
                                                value={finishForm.finished_at}
                                                onChange={(event) =>
                                                    setFinishForm((current) => ({
                                                        ...current,
                                                        finished_at: event.target.value,
                                                    }))
                                                }
                                            />
                                        </label>

                                        <label>
                                            Rating (required)
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={finishForm.rating}
                                                onChange={(event) =>
                                                    setFinishForm((current) => ({
                                                        ...current,
                                                        rating: event.target.value,
                                                    }))
                                                }
                                            />
                                        </label>

                                        <label>
                                            Review (optional)
                                            <textarea
                                                rows="4"
                                                value={finishForm.review}
                                                onChange={(event) =>
                                                    setFinishForm((current) => ({
                                                        ...current,
                                                        review: event.target.value,
                                                    }))
                                                }
                                            />
                                        </label>

                                        <div className="button-row">
                                            <button
                                                className="button"
                                                type="button"
                                                onClick={() => handleFinishBook(log.id)}
                                            >
                                                Save finish details
                                            </button>
                                            <button
                                                className="button button--ghost"
                                                type="button"
                                                onClick={() => setFinishTargetId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        ))
                    )}
                </div>

                <div className="stack">
                    <h2>Recently read</h2>
                    {recentReads.length === 0 ? (
                        <div className="panel">You have not finished any books yet.</div>
                    ) : (
                        recentReads.map((log) => (
                            <article className="card" key={log.id}>
                                <h3>
                                    <Link to={`/books/${log.book.id}`}>{log.book.title}</Link>
                                </h3>
                                <p className="muted">{log.book.authors?.map((author) => author.name).join(", ")}</p>
                                <p className="badge">{log.status}</p>
                            </article>
                        ))
                    )}
                </div>
            </div>

            <div className="stack">
                <ShelfEditor onCreate={handleCreateShelf} isSubmitting={isCreatingShelf} />

                <div className="stack">
                    <h2>My shelves</h2>
                    {shelves.length === 0 ? (
                        <div className="panel">Create a shelf to feature book collections on your profile.</div>
                    ) : (
                        shelves.map((shelf) => (
                            <article className="card" key={shelf.id}>
                                <div className="row row--space">
                                    <div>
                                        <h3>{shelf.name}</h3>
                                        <p className="muted">
                                            {shelf.is_public ? "Visible on your public profile" : "Private shelf"}
                                        </p>
                                    </div>
                                    <button className="button button--ghost" onClick={() => handleToggleShelf(shelf)}>
                                        {shelf.is_public ? "Make private" : "Make public"}
                                    </button>
                                </div>
                                {shelf.items.length === 0 ? (
                                    <p className="muted">No books added yet.</p>
                                ) : (
                                    <ul className="simple-list">
                                        {shelf.items.map((item) => (
                                            <li key={item.id}>
                                                <Link to={`/books/${item.book.id}`}>{item.book.title}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export default ProfilePage;