# Scientific News Summarizer

A full-stack web application that fetches the latest scientific news from multiple RSS feeds, extracts full article content, and generates AI-powered summaries using state-of-the-art language models.

## Features

- **Multi-Source RSS Feed Aggregation**: Fetches articles from ScienceDaily, Phys.org, NASA, Nature News, and Scientific American
- **AI-Powered Summarization**: Uses Facebook's BART-large-CNN model for generating concise, accurate summaries
- **Advanced Filtering**: Filter articles by date range and scientific domain
- **Keyword Search**: Search articles by title or summary content
- **Domain Analytics**: Visual dashboard showing article distribution across scientific domains
- **Responsive Design**: Beautiful, mobile-friendly interface built with React and Tailwind CSS
- **Smart Caching**: Prevents redundant processing of already-fetched articles
- **Pagination**: Smooth navigation through large article collections

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **feedparser**: RSS feed parsing
- **newspaper3k**: Full article text extraction
- **transformers**: Hugging Face model integration
- **PyTorch**: Deep learning framework
- **SQLite**: Local database storage

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool
- **Lucide React**: Beautiful icon library

## Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. Navigate to the project root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Initial Setup**: When you first open the application, click the "Refresh Feed" button to fetch the latest scientific news articles.

2. **Browse Articles**: Scroll through the summarized articles displayed in a card layout.

3. **Filter by Domain**: Use the sidebar to filter articles by scientific domains like Physics, Biology, AI, Astronomy, etc.

4. **Filter by Date**: Set a date range to view articles published within specific time periods.

5. **Search**: Use the search bar to find articles by keywords in titles or summaries.

6. **View Details**: Click on any article card to open a modal with the full summary and original article link.

7. **View Analytics**: Check the domain distribution chart to see which scientific fields have the most coverage.

8. **Refresh**: Click "Refresh Feed" periodically to fetch new articles from RSS feeds.

## API Endpoints

### GET `/articles`
Retrieve articles with optional filters
- Query Parameters:
  - `start_date`: Filter by start date (ISO format)
  - `end_date`: Filter by end date (ISO format)
  - `domains`: Comma-separated list of domains
  - `search`: Search query string
  - `page`: Page number (default: 1)
  - `page_size`: Items per page (default: 20)

### GET `/domains`
Get article count statistics by domain

### POST `/refresh`
Trigger a refresh of RSS feeds and fetch new articles

### GET `/refresh/status`
Check if a refresh operation is currently in progress

## Database Schema

The application uses SQLite with the following schema:

```sql
CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    published_date TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_text TEXT,
    source TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## Domain Detection

Articles are automatically categorized into scientific domains based on keyword analysis:

- **Physics**: quantum, particle, energy, mechanics, relativity
- **Biology**: cell, gene, evolution, organism, ecology
- **Astronomy**: space, planet, star, galaxy, telescope, NASA
- **AI**: artificial intelligence, machine learning, neural network
- **Medicine**: health, disease, treatment, clinical, therapy
- **Chemistry**: chemical, molecule, compound, reaction
- **Earth Science**: climate, geology, ocean, atmosphere
- **Technology**: computer, software, engineering, innovation
- **Neuroscience**: brain, cognitive, neuron, consciousness
- **General Science**: Fallback category for unmatched articles

## Configuration

### RSS Feeds
To add or modify RSS feeds, edit the `RSS_FEEDS` dictionary in `backend/rss_fetcher.py`:

```python
RSS_FEEDS = {
    "Source Name": "https://example.com/rss",
}
```

### Domain Keywords
Customize domain detection by modifying `DOMAIN_KEYWORDS` in `backend/rss_fetcher.py`.

### Summarization Model
The default model is `facebook/bart-large-cnn`. To use a different model, update the model name in `backend/summarizer.py`.

## Performance Notes

- **First Run**: The initial model download and article processing may take several minutes.
- **CPU vs GPU**: The application runs on CPU by default. For faster summarization, ensure PyTorch detects your CUDA-enabled GPU.
- **Model Loading**: The summarization model is loaded once and cached for subsequent requests.
- **Article Extraction**: Full text extraction may fail for some articles due to paywalls or JavaScript-heavy sites.

## Troubleshooting

### Backend Issues

**Error: Module not found**
```bash
pip install -r requirements.txt
```

**Error: CUDA out of memory**
- Reduce batch size or use CPU mode
- The application automatically falls back to CPU if CUDA is unavailable

**Error: Article extraction fails**
```bash
pip install lxml_html_clean
```

### Frontend Issues

**Error: Cannot connect to backend**
- Ensure the backend is running on port 8000
- Check that CORS is properly configured
- Verify the API_BASE_URL in `src/services/api.ts`

**Error: Build fails**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Future Enhancements

- Export summaries to CSV/JSON
- Email notifications for new articles in specific domains
- Auto-refresh scheduler (every 6 hours)
- User authentication and personalized feeds
- Bookmark/save favorite articles
- Share summaries on social media
- Multi-language support
- Custom RSS feed addition via UI

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Credits

- RSS Feeds: ScienceDaily, Phys.org, NASA, Nature, Scientific American
- Summarization Model: Facebook AI (BART-large-CNN)
- Icons: Lucide React
- UI Framework: React + Tailwind CSS