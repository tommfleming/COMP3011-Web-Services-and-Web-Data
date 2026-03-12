import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/client";

function UserList({ title, entries, showUnfollow = false, showRemoveFollower = false, onUnfollow, onRemoveFollower }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            {entries.length === 0 ? (
                <p className="muted">Nobody to show here yet.</p>
            ) : (
                <div className="friend-list">
                    {entries.map((entry) => (
                        <div className="friend-list__item" key={`${title}-${entry.user.id}`}>
                            <Link to={`/users/${entry.user.username}`}>{entry.user.username}</Link>
                            <div className="friend-list__actions">
                                {showUnfollow && entry.follow_id && (
                                    <button
                                        className="button button--ghost"
                                        type="button"
                                        onClick={() => onUnfollow(entry.follow_id)}
                                    >
                                        Remove following
                                    </button>
                                )}
                                {showRemoveFollower && entry.follower_user_id && (
                                    <button
                                        className="button button--ghost"
                                        type="button"
                                        onClick={() => onRemoveFollower(entry.follower_user_id)}
                                    >
                                        Remove follower
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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

    async function handleSearch(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        try {
            const data = await api.searchUsers(searchTerm);
            setSearchResults(data);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleFollow(userId) {
        setError("");
        setSuccess("");
        try {
            await api.followUser(userId);
            setSuccess("Friend added.");
            await loadFriends();
            if (searchTerm.trim()) {
                const data = await api.searchUsers(searchTerm);
                setSearchResults(data);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleUnfollow(followId) {
        setError("");
        setSuccess("");
        try {
            await api.unfollow(followId);
            setSuccess("Following removed.");
            await loadFriends();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleRemoveFollower(userId) {
        setError("");
        setSuccess("");
        try {
            await api.removeFollower(userId);
            setSuccess("Follower removed.");
            await loadFriends();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <section className="page-grid">
            <div className="stack">
                <div className="card form-stack">
                    <h1>Friends</h1>
                    <p className="muted">
                        Search usernames, add friends, and manage who you follow or who follows you.
                    </p>

                    <form className="form-stack" onSubmit={handleSearch}>
                        <label>
                            Search usernames
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search for a user"
                            />
                        </label>
                        <div className="button-row">
                            <button className="button" type="submit">Search</button>
                        </div>
                    </form>

                    {error && <p className="form-error">{error}</p>}
                    {success && <p className="form-success">{success}</p>}

                    {searchResults.length > 0 && (
                        <div className="friend-list">
                            {searchResults.map((user) => (
                                <div className="friend-list__item" key={`search-${user.id}`}>
                                    <Link to={`/users/${user.username}`}>{user.username}</Link>
                                    {user.is_following ? (
                                        <span className="muted">Already following</span>
                                    ) : (
                                        <button
                                            className="button"
                                            type="button"
                                            onClick={() => handleFollow(user.id)}
                                        >
                                            Add friend
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="page-grid page-grid--three-column">
                    <UserList
                        title="Mutual friends"
                        entries={groups.friends}
                        showUnfollow
                        showRemoveFollower
                        onUnfollow={handleUnfollow}
                        onRemoveFollower={handleRemoveFollower}
                    />

                    <UserList
                        title="You follow"
                        entries={groups.following_only}
                        showUnfollow
                        onUnfollow={handleUnfollow}
                    />

                    <UserList
                        title="Following you"
                        entries={groups.followers_only}
                        showRemoveFollower
                        onRemoveFollower={handleRemoveFollower}
                    />
                </div>
            </div>
        </section>
    );
}

export default FriendsPage;