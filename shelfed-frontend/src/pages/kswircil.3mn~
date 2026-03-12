import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

function PublicProfilePage() {
    const { username } = useParams();

    const [profile, setProfile] = useState(null);
    const [viewer, setViewer] = useState(null);
    const [targetUserId, setTargetUserId] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadPage();
    }, [username]);

    async function loadPage() {
        setError("");
        setSuccess("");

        try {
            const publicProfile = await api.getPublicProfile(username);
            setProfile(publicProfile);

            try {
                const currentUser = await api.getMe();
                setViewer(currentUser);

                if (currentUser.username === username) {
                    setTargetUserId(null);
                    setIsFollowing(false);
                    return;
                }

                const searchResults = await api.searchUsers(username);
                const exactMatch = searchResults.find(
                    (user) => user.username.toLowerCase() === username.toLowerCase()
                );

                if (exactMatch) {
                    setTargetUserId(exactMatch.id);
                    setIsFollowing(Boolean(exactMatch.is_following));
                } else {
                    setTargetUserId(null);
                    setIsFollowing(false);
                }
            } catch (_err) {
                setViewer(null);
                setTargetUserId(null);
                setIsFollowing(false);
            }
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleAddFriend() {
        if (!targetUserId) return;

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await api.followUser(targetUserId);
            setIsFollowing(true);
            setSuccess("Friend added.");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (error && !profile) {
        return <div className="panel form-error">{error}</div>;
    }

    if (!profile) {
        return <div className="panel">Loading profile…</div>;
    }

    const isOwnProfile = viewer?.username === profile.user.username;

    return (
        <section className="page-grid page-grid--two-column">
            <div className="stack">
                <div className="card">
                    <p className="eyebrow">Reader profile</p>
                    <h1>{profile.user.username}</h1>

                    <div className="stats-grid">
                        <div className="stat">
                            <strong>{profile.stats.public_shelves}</strong>
                            <span>Public shelves</span>
                        </div>
                        <div className="stat">
                            <strong>{profile.stats.reviews}</strong>
                            <span>Reviews</span>
                        </div>
                        <div className="stat">
                            <strong>{profile.stats.followers}</strong>
                            <span>Followers</span>
                        </div>
                        <div className="stat">
                            <strong>{profile.stats.following}</strong>
                            <span>Following</span>
                        </div>
                    </div>

                    {!isOwnProfile && viewer && (
                        <div className="button-row">
                            {isFollowing ? (
                                <button className="button button--ghost" type="button" disabled>
                                    Following
                                </button>
                            ) : (
                                <button
                                    className="button"
                                    type="button"
                                    disabled={isSubmitting || !targetUserId}
                                    onClick={handleAddFriend}
                                >
                                    {isSubmitting ? "Adding…" : "Add friend"}
                                </button>
                            )}
                        </div>
                    )}

                    {error && <p className="form-error">{error}</p>}
                    {success && <p className="form-success">{success}</p>}
                </div>

                <div className="stack">
                    <h2>Recently read</h2>
                    {profile.recent_reads?.length ? (
                        profile.recent_reads.map((log) => (
                            <article className="card" key={log.id}>
                                <h3>
                                    <Link to={`/books/${log.book.id}`}>{log.book.title}</Link>
                                </h3>
                                <p className="muted">
                                    {log.book.authors?.map((author) => author.name).join(", ")}
                                </p>
                            </article>
                        ))
                    ) : (
                        <div className="panel">No recent reads to show.</div>
                    )}
                </div>
            </div>

            <div className="stack">
                <h2>Public shelves</h2>
                {profile.public_shelves?.length ? (
                    profile.public_shelves.map((shelf) => (
                        <article className="card" key={shelf.id}>
                            <h3>{shelf.name}</h3>
                            {shelf.items?.length ? (
                                <ul className="simple-list">
                                    {shelf.items.map((item) => (
                                        <li key={item.id}>
                                            <Link to={`/books/${item.book.id}`}>{item.book.title}</Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="muted">No books on this shelf yet.</p>
                            )}
                        </article>
                    ))
                ) : (
                    <div className="panel">This reader has no public shelves yet.</div>
                )}
            </div>
        </section>
    );
}

export default PublicProfilePage;