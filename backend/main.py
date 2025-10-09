from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio

from database import (
    init_database,
    insert_article,
    get_articles,
    get_article_count,
    get_domain_statistics,
    article_exists
)
from rss_fetcher import fetch_rss_articles, enrich_article_with_full_text
from summarizer import summarize_article

app = FastAPI(title="Scientific News Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_database()

class ArticleResponse(BaseModel):
    id: int
    title: str
    link: str
    domain: str
    published_date: str
    summary: str
    full_text: Optional[str]
    source: str
    created_at: str

class ArticlesListResponse(BaseModel):
    articles: List[ArticleResponse]
    total: int
    page: int
    page_size: int

class DomainStats(BaseModel):
    domain: str
    count: int

class RefreshResponse(BaseModel):
    status: str
    message: str
    new_articles: int

is_refreshing = False

@app.get("/")
async def root():
    return {"message": "Scientific News Summarizer API", "status": "running"}

@app.get("/articles", response_model=ArticlesListResponse)
async def list_articles(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    domains: Optional[str] = Query(None),
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    domain_list = domains.split(",") if domains else None

    offset = (page - 1) * page_size

    articles = get_articles(
        start_date=start_date,
        end_date=end_date,
        domains=domain_list,
        search_query=search,
        limit=page_size,
        offset=offset
    )

    total = get_article_count(
        start_date=start_date,
        end_date=end_date,
        domains=domain_list,
        search_query=search
    )

    return {
        "articles": articles,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@app.get("/domains", response_model=List[DomainStats])
async def list_domains():
    stats = get_domain_statistics()
    return stats

@app.post("/refresh", response_model=RefreshResponse)
async def refresh_feed(background_tasks: BackgroundTasks):
    global is_refreshing

    if is_refreshing:
        return {
            "status": "in_progress",
            "message": "A refresh is already in progress",
            "new_articles": 0
        }

    background_tasks.add_task(perform_refresh)

    return {
        "status": "started",
        "message": "Refresh started in background",
        "new_articles": 0
    }

async def perform_refresh():
    global is_refreshing
    is_refreshing = True
    new_articles_count = 0

    try:
        print("Fetching RSS articles...")
        articles = fetch_rss_articles(max_articles_per_feed=10)

        for article in articles:
            if article_exists(article['link']):
                print(f"Article already exists: {article['title']}")
                continue

            print(f"Processing new article: {article['title']}")

            article = enrich_article_with_full_text(article)

            article = summarize_article(article)

            result = insert_article(article)
            if result:
                new_articles_count += 1
                print(f"Added article: {article['title']}")

        print(f"Refresh complete. Added {new_articles_count} new articles.")

    except Exception as e:
        print(f"Error during refresh: {e}")

    finally:
        is_refreshing = False

@app.get("/refresh/status")
async def refresh_status():
    return {
        "is_refreshing": is_refreshing
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)