# Recipe Extractor & Meal Planner 🍲

An AI-powered recipe extraction and meal planning application. This tool automatically scrapes recipe blog posts, structures the unstructured HTML into clean JSON data using a Large Language Model (Gemini via Langchain), and allows users to generate cohesive meal planner shopping lists.

## Tech Stack
- **Backend**: Python, FastAPI, SQLAlchemy, Langchain, BeautifulSoup4
- **Database**: PostgreSQL (provided via `docker-compose`)
- **Frontend**: Vanilla Javascript, HTML5, Modern CSS (Glassmorphism + Animations)
- **AI / LLM**: Langchain via `langchain-google-genai` (Gemini 1.5 Flash)

## Setup Instructions

### 1. Backend & Database
1. Set up the environment variables:
   Create a `.env` file inside the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/recipe_db
   ```
2. Start the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```
3. Setup the Python Virtual Environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
4. Run the FastAPI Application:
   ```bash
   uvicorn main:app --reload
   ```

### 2. Frontend
Since the frontend uses standard HTML, CSS, and JS (to ensure seamless local testing without Node.js requirements), simply open `frontend/index.html` in any web browser!

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/extract` | Provide an `{ url: "..." }` body. Scrapes and processes the recipe mapping to LLM JSON. |
| `GET` | `/api/history` | Fetches all stored recipes in the PostgreSQL database. |
| `GET` | `/api/history/{id}` | Fetches a specific recipe details by ID. |

## Application Features
- **Tab 1: Extract Recipe**: Paste a URL, invoke Gemini and display formatted details.
- **Tab 2: Saved Recipes**: View the extraction history fetched from PostgreSQL. 
- **Tab 3: Meal Planner**: Generate merged, combined shopping lists across selected recipes.

## Screenshots
Please check the submission directory or refer to the `walkthrough.md` generated alongside this application.
