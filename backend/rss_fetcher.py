import feedparser
from newspaper import Article
from datetime import datetime
from typing import List, Dict
import re

RSS_FEEDS = {
    "ScienceDaily": "https://www.sciencedaily.com/rss/all.xml",
    "Phys.org": "https://phys.org/rss-feed/",
    "NASA": "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    "Nature News": "https://www.nature.com/nature.rss",
    "Scientific American": "https://www.scientificamerican.com/feed/",
}

DOMAIN_KEYWORDS = {
    "Physics": ["physics", "quantum", "particle", "energy", "mechanics", "relativity"],
    "Biology": ["biology", "cell", "gene", "evolution", "organism", "ecology", "molecular"],
    "Astronomy": ["space", "astronomy", "planet", "star", "galaxy", "universe", "cosmic", "telescope", "nasa"],
    "AI": ["artificial intelligence", "machine learning", "neural network", "deep learning", "AI", "algorithm"],
    "Medicine": ["medicine", "health", "disease", "treatment", "clinical", "patient", "drug", "therapy"],
    "Chemistry": ["chemistry", "chemical", "molecule", "compound", "reaction", "catalyst"],
    "Earth Science": ["climate", "geology", "ocean", "atmosphere", "earthquake", "weather", "environmental"],
    "Technology": ["technology", "computer", "software", "engineering", "innovation", "device"],
    "Neuroscience": ["brain", "neuroscience", "cognitive", "neuron", "consciousness", "psychology"],
}

def detect_domain(title: str, summary: str = "") -> str:
    text = (title + " " + summary).lower()

    domain_scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword.lower() in text)
        if score > 0:
            domain_scores[domain] = score

    if domain_scores:
        return max(domain_scores.items(), key=lambda x: x[1])[0]

    return "General Science"

def extract_article_text(url: str, max_retries: int = 2) -> str:
    for attempt in range(max_retries):
        try:
            article = Article(url)
            article.download()
            article.parse()
            return article.text if article.text else ""
        except Exception as e:
            if attempt == max_retries - 1:
                return ""
            continue
    return ""

def fetch_rss_articles(max_articles_per_feed: int = 10) -> List[Dict]:
    all_articles = []

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(feed_url)

            for entry in feed.entries[:max_articles_per_feed]:
                try:
                    title = entry.get('title', 'No Title')
                    link = entry.get('link', '')

                    if not link:
                        continue

                    published = entry.get('published_parsed') or entry.get('updated_parsed')
                    if published:
                        published_date = datetime(*published[:6]).isoformat()
                    else:
                        published_date = datetime.now().isoformat()

                    summary_text = entry.get('summary', '') or entry.get('description', '')
                    summary_text = re.sub('<[^<]+?>', '', summary_text)[:500]

                    domain = detect_domain(title, summary_text)

                    article_data = {
                        'title': title,
                        'link': link,
                        'domain': domain,
                        'published_date': published_date,
                        'summary': summary_text,
                        'full_text': '',
                        'source': source_name
                    }

                    all_articles.append(article_data)

                except Exception as e:
                    print(f"Error processing entry from {source_name}: {e}")
                    continue

        except Exception as e:
            print(f"Error fetching feed {source_name}: {e}")
            continue

    return all_articles

def enrich_article_with_full_text(article: Dict) -> Dict:
    try:
        full_text = extract_article_text(article['link'])
        article['full_text'] = full_text
    except Exception as e:
        print(f"Error extracting text from {article['link']}: {e}")
        article['full_text'] = ""

    return article