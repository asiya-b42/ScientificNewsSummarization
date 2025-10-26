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
    "Physics": ["quantum", "particle", "mechanics", "relativity", "electromagnetic", "magnetic", "gravitational", "laser", "photon", "electron"],
    "Biology": ["cell", "gene", "evolution", "organism", "ecology", "molecular biology", "genetic", "dna", "protein", "bacteria", "species", "organism", "biological"],
    "Agriculture": ["crop", "harvest", "sorghum", "wheat", "rice", "corn", "maize", "field", "farming", "agricultural", "biomass", "yield", "hybrid", "nitrogen", "fertilizer"],
    "Astronomy": ["space", "astronomy", "planet", "star", "galaxy", "universe", "cosmic", "telescope", "nasa", "solar system", "exoplanet", "black hole"],
    "AI": ["artificial intelligence", "machine learning", "neural network", "deep learning", "chatbot", "llm", "gpt", "transformer model", "AI model", "algorithmic"],
    "Medicine": ["medicine", "disease", "treatment", "clinical", "patient", "drug", "therapy", "sleep", "diet", "nutrition", "hospital", "doctor", "medical", "healthcare", "diagnosis", "syndrome"],
    "Chemistry": ["chemistry", "chemical", "molecule", "compound", "reaction", "catalyst", "organic chemistry", "inorganic", "synthesis", "polymer"],
    "Earth Science": ["climate", "geology", "ocean", "atmosphere", "earthquake", "weather", "environmental", "ecosystem", "biodiversity", "geological"],
    "Technology": ["computer", "software", "engineering", "innovation", "device", "robot", "automation", "digital", "electronic", "technology"],
    "Neuroscience": ["brain", "neuroscience", "cognitive", "neuron", "consciousness", "psychology", "memory", "mental health", "depression", "anxiety", "cognitive function"],
}

def detect_domain(title: str, summary: str = "", full_text: str = "") -> str:
    # Combine all text sources for better classification
    text = (title + " " + summary + " " + full_text).lower()

    # Give more weight to title and summary
    title_summary = (title + " " + summary).lower()
    
    domain_scores = {}
    
    for domain, keywords in DOMAIN_KEYWORDS.items():
        # Weighted scoring
        title_score = sum(3 for keyword in keywords if keyword.lower() in title.lower())
        summary_score = sum(2 for keyword in keywords if keyword.lower() in summary.lower())
        full_text_score = sum(1 for keyword in keywords if keyword.lower() in text) if full_text else 0
        
        total_score = title_score + summary_score + full_text_score
        
        if total_score > 0:
            domain_scores[domain] = total_score

    if domain_scores:
        # Get the domain with the highest score
        best_domain, best_score = max(domain_scores.items(), key=lambda x: x[1])
        
        # Require minimum threshold to avoid false positives
        if best_score < 1:
            return "General Science"
        
        # Special handling for conflicting domains
        # Agriculture vs Biology
        if best_domain == "Biology" and "agriculture" in domain_scores:
            if any(word in text for word in ["crop", "field", "harvest", "sorghum", "hybrid", "biomass"]):
                return "Agriculture"
        
        # Medicine vs other domains
        if best_domain != "Medicine" and "medicine" in domain_scores:
            medicine_score = domain_scores["Medicine"]
            if any(word in text for word in ["sleep", "diet", "nutrition", "health", "patient", "therapy", "clinical"]) and medicine_score >= best_score:
                return "Medicine"
        
        # Physics vs other domains (avoid false positives)
        if best_domain == "Physics":
            # Only classify as Physics if there are strong indicators
            physics_strong = any(word in text for word in ["quantum", "particle", "laser", "electromagnetic", "photon", "electron", "relativity"])
            if not physics_strong and best_score < 3:
                # Check if other domain has better score
                for domain, score in domain_scores.items():
                    if domain != "Physics" and score >= best_score:
                        return domain
        
        return best_domain

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

                    # For initial classification, use only title and summary
                    domain = detect_domain(title, summary_text, "")

                    article_data = {
                        'title': title,
                        'link': link,
                        'domain': domain,  # Initial classification
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
        
        # Re-classify with full text for better accuracy
        if full_text:
            article['domain'] = detect_domain(article['title'], article['summary'], full_text)
    except Exception as e:
        print(f"Error extracting text from {article['link']}: {e}")
        article['full_text'] = ""

    return article