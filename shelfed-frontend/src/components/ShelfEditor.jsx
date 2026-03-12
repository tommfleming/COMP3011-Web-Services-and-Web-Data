import { useState } from "react";

function ShelfEditor({ onCreate, isSubmitting = false }) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;

    await onCreate({
      name: name.trim(),
      is_public: isPublic,
    });

    setName("");
    setIsPublic(true);
  }

  return (
    <form className="card form-stack" onSubmit={handleSubmit}>
      <h3>Create a new shelf</h3>
      <label>
        Shelf name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sci-Fi Favourites"
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
        />
        Make shelf public
      </label>

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create shelf"}
      </button>
    </form>
  );
}

export default ShelfEditor;
