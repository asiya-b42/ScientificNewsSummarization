import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
from contextlib import contextmanager

DATABASE_PATH = "scientific_news.db"

@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS articles (
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
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_published_date ON articles(published_date DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_domain ON articles(domain)")

def insert_article(article: Dict) -> Optional[int]:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO articles (title, link, domain, published_date, summary, full_text, source)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                article['title'],
                article['link'],
                article['domain'],
                article['published_date'],
                article['summary'],
                article.get('full_text', ''),
                article['source']
            ))
            return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None

def get_articles(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    domains: Optional[List[str]] = None,
    search_query: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> List[Dict]:
    with get_db_connection() as conn:
        cursor = conn.cursor()

        query = "SELECT * FROM articles WHERE 1=1"
        params = []

        if start_date:
            query += " AND published_date >= ?"
            params.append(start_date)

        if end_date:
            query += " AND published_date <= ?"
            params.append(end_date)

        if domains and len(domains) > 0:
            placeholders = ','.join('?' * len(domains))
            query += f" AND domain IN ({placeholders})"
            params.extend(domains)

        if search_query:
            query += " AND (title LIKE ? OR summary LIKE ?)"
            search_term = f"%{search_query}%"
            params.extend([search_term, search_term])

        query += " ORDER BY published_date DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [dict(row) for row in rows]

def get_article_count(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    domains: Optional[List[str]] = None,
    search_query: Optional[str] = None
) -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()

        query = "SELECT COUNT(*) as count FROM articles WHERE 1=1"
        params = []

        if start_date:
            query += " AND published_date >= ?"
            params.append(start_date)

        if end_date:
            query += " AND published_date <= ?"
            params.append(end_date)

        if domains and len(domains) > 0:
            placeholders = ','.join('?' * len(domains))
            query += f" AND domain IN ({placeholders})"
            params.extend(domains)

        if search_query:
            query += " AND (title LIKE ? OR summary LIKE ?)"
            search_term = f"%{search_query}%"
            params.extend([search_term, search_term])

        cursor.execute(query, params)
        result = cursor.fetchone()
        return result['count'] if result else 0

def get_domain_statistics() -> List[Dict]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT domain, COUNT(*) as count
            FROM articles
            GROUP BY domain
            ORDER BY count DESC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def article_exists(link: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM articles WHERE link = ?", (link,))
        return cursor.fetchone() is not None