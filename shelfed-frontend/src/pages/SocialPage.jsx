import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

function SocialPage() {
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setError("");
    try {
      const data = await api.getFeed();
      setFeed(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(bookId) {
    try {
      await api.saveBook(bookId);
      alert("Saved for later.");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="page-grid">
      <div className="stack">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Social feed</p>
            <h1>What your friends have been reading</h1>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        {feed.length === 0 ? (
          <div className="panel">
            Your feed is empty right now. Follow some users and wait for them to log books or write reviews.
          </div>
        ) : (
          feed.map((item, index) => (
            <article className="card" key={`${item.type}-${item.book_id}-${index}`}>
              <div className="row row--space">
                <div>
                  <p className="muted">
                    <Link to={`/users/${item.username}`}>{item.username}</Link>
                  </p>
                  <h3>
                    <Link to={`/books/${item.book_id}`}>{item.book_title}</Link>
                  </h3>
                </div>
                <button className="button button--ghost" onClick={() => handleSave(item.book_id)}>
                  Save later
                </button>
              </div>

              {item.type === "review" ? (
                <>
                  <p className="badge">Review • {item.rating}/5</p>
                  <p>{item.text || "No written review provided."}</p>
                </>
              ) : (
                <>
                  <p className="badge">Reading update • {item.status}</p>
                  {item.finished_at && <p className="muted">Finished: {item.finished_at}</p>}
                  {item.started_at && <p className="muted">Started: {item.started_at}</p>}
                </>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default SocialPage;
