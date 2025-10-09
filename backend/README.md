# Scientific News Summarizer - Backend

FastAPI backend for fetching, extracting, and summarizing scientific news articles.

## Quick Start

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Notes

- First run will download the BART-large-CNN model (~1.6GB)
- Article extraction works best with publicly accessible articles
- The database file `scientific_news.db` will be created automatically