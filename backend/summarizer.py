from transformers import pipeline
import torch
from typing import Dict

summarizer = None

def initialize_summarizer():
    global summarizer
    if summarizer is None:
        device = 0 if torch.cuda.is_available() else -1
        summarizer = pipeline(
            "summarization",
            model="facebook/bart-large-cnn",
            device=device
        )
    return summarizer

def generate_summary(text: str, max_length: int = 150, min_length: int = 50) -> str:
    if not text or len(text.strip()) < 100:
        return text

    try:
        model = initialize_summarizer()

        input_text = text[:1024]

        result = model(
            input_text,
            max_length=max_length,
            min_length=min_length,
            do_sample=False,
            truncation=True
        )

        summary = result[0]['summary_text']
        return summary

    except Exception as e:
        print(f"Error generating summary: {e}")
        return text[:200] + "..."

def summarize_article(article: Dict) -> Dict:
    text_to_summarize = article.get('full_text', '') or article.get('summary', '')

    if text_to_summarize and len(text_to_summarize) > 200:
        article['summary'] = generate_summary(text_to_summarize)
    elif not article.get('summary'):
        article['summary'] = text_to_summarize[:200] if text_to_summarize else "No summary available."

    return article