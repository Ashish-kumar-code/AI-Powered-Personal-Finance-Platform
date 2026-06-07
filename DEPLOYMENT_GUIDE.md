# Deployment Guide (Concise)

## Overview
- Backend: `innobytes` (Flask)
- Frontend: `frontend` (React + Vite)

## Recommended: Render (backend) + Vercel (frontend)

### Render (Backend)
1. Create a new Web Service on Render and link your GitHub repo.
2. Set the root directory to `innobytes`.
3. Use Docker (recommended) — Render will use `innobytes/Dockerfile`.
   - Or use a Python service with start command: `gunicorn --bind 0.0.0.0:$PORT app:app`.
4. Add environment variables: `FLASK_APP=app.py`, `PYTHONUNBUFFERED=1`, and any secrets.

### Vercel (Frontend)
1. Create a new project, link the same GitHub repo.
2. Set the root directory to `frontend`.
3. Build command: `npm install && npm run build`.
4. Output directory: `dist`.
5. Add env var: `VITE_API_BASE=https://<your-backend-url>/api`.

## Docker (optional single-container)
Build and run locally:

```bash
cd innobytes
docker build -t finance-backend .
docker run -p 5000:5000 -e FLASK_APP=app -e PYTHONUNBUFFERED=1 finance-backend
```

To include frontend in same image, copy `frontend/dist` into the image and serve via a static server or configure Flask to serve static files.

## Local quick-start
Backend:

```powershell
cd innobytes
py -3 -m pip install -r requirements.txt
py -3 -m flask run --host 0.0.0.0 --port 5000
```

Frontend:

```powershell
cd frontend
npm install
npm run build
npx vite preview --host 0.0.0.0 --port 4173
```

## Notes
- Large model artifacts (`*.joblib`) and local DB files are excluded from git. Store models in cloud storage or add to deployment separately.
- Ensure `VITE_API_BASE` points to your deployed backend URL.
