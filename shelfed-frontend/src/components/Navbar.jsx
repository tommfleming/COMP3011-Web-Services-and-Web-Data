import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__brand">
        <NavLink to="/" className="brand-link">
          Shelfed
        </NavLink>
      </div>

      <nav className="navbar__links">
        <NavLink to="/discover">Discover</NavLink>
        {isAuthenticated && <NavLink to="/social">Social</NavLink>}
        {isAuthenticated && <NavLink to="/saved">Saved</NavLink>}
        {isAuthenticated && <NavLink to="/friends">Friends</NavLink>}
        {isAuthenticated && <NavLink to="/log-book">Log a Book</NavLink>}
        {isAuthenticated && <NavLink to="/profile">Profile</NavLink>}
      </nav>

      <div className="navbar__auth">
        {isAuthenticated ? (
          <>
            <span className="muted">Signed in as {user?.username}</span>
            <button className="button button--ghost" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="button button--ghost">
              Login
            </NavLink>
            <NavLink to="/register" className="button">
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
