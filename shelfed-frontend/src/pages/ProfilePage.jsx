import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ShelfEditor from "../components/ShelfEditor";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);

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
    try {
      await api.createShelf(payload);
      await loadProfile();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsCreatingShelf(false);
    }
  }

  async function handleToggleShelf(shelf) {
    try {
      await api.updateShelf(shelf.id, { is_public: !shelf.is_public });
      await loadProfile();
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) {
    return <div className="panel form-error">{error}</div>;
  }

  if (!profile) {
    return <div className="panel">Loading your profile…</div>;
  }

  const shelves = profile.shelves || [];
  const recentReads = profile.recent_reads || [];

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
