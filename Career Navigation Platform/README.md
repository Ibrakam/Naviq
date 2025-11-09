
  # Career Navigation Platform

  This Vite/React bundle is now wired to the FastAPI backend that lives in the `/app` folder of this repository.

  ## Environment

  Create a `.env` file next to this README (or copy `.env.example`) and point the frontend to the backend URL:

  ```bash
  VITE_API_URL=http://127.0.0.1:8000
  ```

  The frontend talks to the backend through the `/make-server-a1779b8e/*` routes exposed by FastAPI, so make sure the API is running (e.g. `uvicorn app.main:app --reload`).

  ## Running the code

  ```bash
  npm install
  npm run dev
  ```

  The dev server defaults to `http://localhost:5173`.
  
