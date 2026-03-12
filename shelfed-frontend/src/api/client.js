const API_BASE = "/api";

class ApiError extends Error {
    constructor(message, fields = {}) {
        super(message);
        this.name = "ApiError";
        this.fields = fields;
    }
}

function getToken() {
    return localStorage.getItem("shelfed_token");
}

function firstErrorMessage(value) {
    if (Array.isArray(value)) return value[0];
    if (typeof value === "string") return value;
    return "";
}

function extractFieldErrors(data = {}) {
    const fieldErrors = {};

    Object.entries(data).forEach(([key, value]) => {
        if (key === "detail" || key === "non_field_errors") return;
        const message = firstErrorMessage(value);
        if (message) {
            fieldErrors[key] = message;
        }
    });

    return fieldErrors;
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");

    const isJsonBody =
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type");

    if (isJsonBody) {
        headers.set("Content-Type", "application/json");
    }

    const token = getToken();
    if (token) {
        headers.set("Authorization", `Token ${token}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        body:
            isJsonBody && typeof options.body !== "string"
                ? JSON.stringify(options.body)
                : options.body,
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const detail =
            data?.detail ||
            data?.non_field_errors?.[0] ||
            data?.title?.[0] ||
            data?.book_id?.[0] ||
            data?.rating?.[0] ||
            "Request failed.";

        throw new ApiError(detail, extractFieldErrors(data));
    }

    return data;
}

function toQueryString(params = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            search.set(key, value);
        }
    });
    const qs = search.toString();
    return qs ? `?${qs}` : "";
}

export const api = {
    register(payload) {
        return request("/auth/register/", {
            method: "POST",
            body: payload,
        });
    },

    login(payload) {
        return request("/auth/login/", {
            method: "POST",
            body: payload,
        });
    },

    logout() {
        return request("/auth/logout/", {
            method: "POST",
        });
    },

    getMe() {
        return request("/auth/me/");
    },

    getBooks(params = {}) {
        return request(`/books/${toQueryString(params)}`);
    },

    getBookFilterOptions() {
        return request("/books/filter-options/");
    },

    getBook(bookId) {
        return request(`/books/${bookId}/`);
    },

    getBookReviews(bookId) {
        return request(`/books/${bookId}/reviews/`);
    },

    createBook(payload) {
        return request("/books/create/", {
            method: "POST",
            body: payload,
        });
    },

    getRecommendations() {
        return request("/social/recommendations/");
    },

    getFeed() {
        return request("/social/feed/");
    },

    getSavedBooks() {
        return request("/social/saved-books/");
    },

    saveBook(bookId) {
        return request("/social/saved-books/", {
            method: "POST",
            body: { book_id: bookId },
        });
    },

    removeSavedBook(bookId) {
        return request(`/social/saved-books/${bookId}/`, {
            method: "DELETE",
        });
    },

    getMyProfile() {
        return request("/social/profile/");
    },

    getPublicProfile(username) {
        return request(`/social/users/${username}/`);
    },

    getFriends() {
        return request("/social/friends/");
    },

    searchUsers(query) {
        return request(`/social/user-search/${toQueryString({ q: query })}`);
    },

    followUser(userId) {
        return request("/social/follows/", {
            method: "POST",
            body: { following_id: userId },
        });
    },

    unfollow(followId) {
        return request(`/social/follows/${followId}/`, {
            method: "DELETE",
        });
    },

    removeFollower(userId) {
        return request(`/social/followers/${userId}/remove/`, {
            method: "DELETE",
        });
    },

    getShelves() {
        return request("/social/shelves/");
    },

    createShelf(payload) {
        return request("/social/shelves/", {
            method: "POST",
            body: payload,
        });
    },

    updateShelf(shelfId, payload) {
        return request(`/social/shelves/${shelfId}/`, {
            method: "PATCH",
            body: payload,
        });
    },

    deleteShelf(shelfId) {
        return request(`/social/shelves/${shelfId}/`, {
            method: "DELETE",
        });
    },

    addBookToShelf(shelfId, bookId) {
        return request(`/social/shelves/${shelfId}/items/`, {
            method: "POST",
            body: { book_id: bookId },
        });
    },

    removeShelfItem(shelfId, itemId) {
        return request(`/social/shelves/${shelfId}/items/${itemId}/`, {
            method: "DELETE",
        });
    },

    createReadingLog(payload) {
        return request("/social/logs/", {
            method: "POST",
            body: payload,
        });
    },

    deleteReadingLog(logId) {
        return request(`/social/logs/${logId}/`, {
            method: "DELETE",
        });
    },

    finishReading(logId, payload) {
        return request(`/social/logs/${logId}/finish/`, {
            method: "POST",
            body: payload,
        });
    },

    createReview(payload) {
        return request("/social/reviews/", {
            method: "POST",
            body: payload,
        });
    },
};