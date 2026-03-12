function ReviewCard({ review }) {
  return (
    <article className="card">
      <div className="row row--space">
        <strong>{review.user?.username || "Anonymous"}</strong>
        <span className="badge">Rating: {review.rating}/5</span>
      </div>
      {review.text ? (
        <p>{review.text}</p>
      ) : (
        <p className="muted">No written review provided.</p>
      )}
    </article>
  );
}

export default ReviewCard;
