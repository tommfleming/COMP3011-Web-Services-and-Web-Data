import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="hero__content">
        <p className="eyebrow">Social reading discovery</p>
        <h1>Shelfed helps readers discover, save, review, and share books.</h1>
        <p className="lead">
          Browse your catalogue, follow readers, build shelves like playlists,
          and get recommendations based on your reading history.
        </p>

        <div className="button-row">
          <Link className="button" to="/discover">
            Explore books
          </Link>
          {isAuthenticated ? (
            <Link className="button button--ghost" to="/social">
              Go to social feed
            </Link>
          ) : (
            <Link className="button button--ghost" to="/register">
              Create an account
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default HomePage;
