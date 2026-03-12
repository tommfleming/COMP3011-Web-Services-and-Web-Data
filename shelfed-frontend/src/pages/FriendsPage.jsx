import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";

function UserList({ title, users }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {users.length === 0 ? (
        <p className="muted">Nobody to show here yet.</p>
      ) : (
        <ul className="simple-list">
          {users.map((user) => (
            <li key={user.id}>
              <Link to={`/users/${user.username}`}>{user.username}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FriendsPage() {
  const [groups, setGroups] = useState({
    friends: [],
    following_only: [],
    followers_only: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    setError("");
    try {
      const data = await api.getFriends();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="page-grid page-grid--three-column">
      {error && <p className="form-error">{error}</p>}
      <UserList title="Mutual friends" users={groups.friends} />
      <UserList title="You follow" users={groups.following_only} />
      <UserList title="Following you" users={groups.followers_only} />
    </section>
  );
}

export default FriendsPage;
