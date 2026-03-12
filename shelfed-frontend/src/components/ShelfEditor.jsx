import { useState } from "react";

function ShelfEditor({ onCreate, isSubmitting = false }) {
    const [form, setForm] = useState({
        name: "",
        is_public: true,
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setFieldErrors({});
        setGeneralError("");

        if (!form.name.trim()) {
            setFieldErrors({ name: "Please enter a shelf name." });
            return;
        }

        try {
            await onCreate(form);
            setForm({
                name: "",
                is_public: true,
            });
        } catch (err) {
            if (err.fields?.name) {
                setFieldErrors({ name: err.fields.name });
            } else {
                setGeneralError(err.message);
            }
        }
    }

    return (
        <form className="card form-stack" onSubmit={handleSubmit}>
            <h2>Create a shelf</h2>

            <label>
                Shelf name
                <input
                    value={form.name}
                    onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="e.g. Desert Island Reads"
                />
                {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </label>

            <label>
                Visibility
                <select
                    value={form.is_public ? "public" : "private"}
                    onChange={(event) =>
                        setForm((current) => ({
                            ...current,
                            is_public: event.target.value === "public",
                        }))
                    }
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </label>

            {generalError && <p className="form-error">{generalError}</p>}

            <button className="button" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating…" : "Create shelf"}
            </button>
        </form>
    );
}

export default ShelfEditor;