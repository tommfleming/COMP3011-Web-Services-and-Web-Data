# Shelfed

Shelfed is a social book-tracking and recommendation platform that combines catalogue data, user reading activity, and social discovery in a single system. Users can browse books, save them for later, create shelves, log reading activity, write reviews, follow friends, and receive personalised recommendations.

## Project Overview

The project was built as a database-backed REST API with a separate frontend client. It combines a seeded public book catalogue with user-generated data such as reading logs, reviews, follows, and curated shelves. The result is a system that supports both personal organisation and social discovery, moving beyond a basic book catalogue into a more interactive reading platform.

### Core features
- Search and filter books by title, author, genre, and publication year
- View book details and reader reviews
- Save and unsave books for later
- Create and manage public/private shelves
- Track books as want to read, reading, or finished
- Rate and review finished books
- Follow users and view public profiles
- View a social feed and personalised recommendations

## Repository Structure

```
COMP3011-Web-Services-and-Web-Data/
├── shelfed-api/						# Django + Django REST Framework backend
├── shelfed-frontend/					# React + Vite frontend
├── docs/
│   └── api-documentation.pdf
└── README.md
└── gitignore.md
```

## Setup Instructions

These steps describe the **current split setup** with the backend and frontend running in separate terminals.

### Prerequisites
- Python 3.13+
- Node.js + npm
- Git

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd COMP3011-Web-Services-and-Web-Data
```

### 2. Start the backend

Open a terminal in `shelfed-api`:

```bash
cd shelfed-api
python -m venv .venv
```

Activate the virtual environment:

**PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

Install dependencies and run migrations:

```bash
python -m pip install -r requirements.txt
python manage.py migrate
```

Optional but recommended for first run:

```bash
python manage.py createsuperuser
python manage.py import_books --per-query 20
```

Start the backend server:

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

### 3. Start the frontend

Open a second terminal in `shelfed-frontend`:

```bash
cd shelfed-frontend
npm install
npm run dev
```

If PowerShell blocks npm scripts on your machine, use `npm.cmd` instead of `npm`, or run the command in Command Prompt.

The frontend will run at:

```text
http://localhost:5173/
```

### 4. Running the full app
- Keep the Django backend running on port `8000`
- Keep the React frontend running on port `5173`
- Open the frontend in your browser and use the UI normally
- API requests are made to the backend under `/api/...`

## API Documentation

The full API documentation PDF for this project is included in the repository at:

```
docs/api-documentation.pdf
```

It documents:
- available endpoints
- request parameters and bodies
- response formats
- authentication
- example requests and responses
- common error codes

## Authentication

Shelfed uses token authentication for protected endpoints.

Typical flow:
1. Register a user
2. Log in to receive a token
3. Send the token in future requests using:

```
Authorization: Token YOUR_TOKEN_HERE
```

## References

- Public book metadata source used for catalogue seeding: Open Library / import process used in development
- API documentation PDF: `docs/api-documentation.pdf`