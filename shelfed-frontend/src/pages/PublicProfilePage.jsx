import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [username]);

  async function loadProfile() {
    setError("");
    try {
      const data = await api.getPublicProfile(username);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return <div className="panel form-error">{error}</div>;
  }

  if (!profile) {
    return <div className="panel">Loading profile…</div>;
  }

  return (
    <section className="page-grid page-grid--two-column">
      <div className="stack">
        <div className="card">
          <p className="eyebrow">Reader profile</p>
          <h1>{profile.user.username}</h1>
          <div className="stats-grid">
            <div className="stat"><strong>{profile.stats.public_shelves}</strong><span>Public shelves</span></div>
            <div className="stat"><strong>{profile.stats.reviews}</strong><span>Reviews</span></div>
            <div className="stat"><strong>{profile.stats.followers}</strong><span>Followers</span></div>
            <div className="stat"><strong>{profile.stats.following}</strong><span>Following</span></div>
          </div>
        </div>

        <div className="stack">
          <h2>Recently read</h2>
          {(profile.recent_reads || []).length === 0 ? (
            <div className="panel">No recent reads shared.</div>
          ) : (
            profile.recent_reads.map((log) => (
              <article className="card" key={log.id}>
                <Link to={`/books/${log.book.id}`}>{log.book.title}</Link>
                <p className="muted">{log.book.authors?.map((author) => author.name).join(", ")}</p>
              </article>
            ))
          )}
        </div>
      </div>

      <div className="stack">
        <h2>Public shelves</h2>
        {(profile.public_shelves || []).length === 0 ? (
          <div className="panel">No public shelves shared yet.</div>
        ) : (
          profile.public_shelves.map((shelf) => (
            <article className="card" key={shelf.id}>
              <h3>{shelf.name}</h3>
              {shelf.items.length === 0 ? (
                <p className="muted">This shelf is empty.</p>
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
    </section>
  );
}

export default PublicProfilePage;
