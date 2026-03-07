# Shelfed API
A Django REST API for social reading discovery. Users can browse books, create shelves, log reading activity, write reviews, follow other users, and view reading analytics.

## Features
- Book catalogue endpoints
- Shelf CRUD
- Reading log CRUD
- Review CRUD
- Follow / unfollow
- Activity feed
- Weekly recap analytics

## Tech Stack
- Django
- Django REST Framework
- drf-spectacular
- SQLite (development)

## Local Setup
1. Clone the repo
2. Create and activate a virtual environment
3. Install dependencies:
   pip install -r requirements.txt
4. Run migrations:
   python manage.py migrate
5. Create a superuser:
   python manage.py createsuperuser
6. Start the server:
   python manage.py runserver

## API Documentation
- Development schema endpoint: `/api/schema/`
- Swagger UI: `/api/docs/`
- PDF copy for submission: `docs/api/api-docs.pdf`

## Coursework Context
This project was developed for COMP3011 Web Services and Web Data.

## Dataset / Sources
- Add your chosen book dataset or API here

## Generative AI Use
See `docs/genai/usage-log.md`.