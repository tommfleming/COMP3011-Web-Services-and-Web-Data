No backend CORS package is required for local development if you use the Vite proxy in `vite.config.js`.

Keep the Django backend on:
- http://127.0.0.1:8000

Keep DRF token auth enabled in `REST_FRAMEWORK`:
- `rest_framework.authentication.TokenAuthentication`
- `rest_framework.authentication.SessionAuthentication`
