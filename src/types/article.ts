export interface Article {
  id: number;
  title: string;
  link: string;
  domain: string;
  published_date: string;
  summary: string;
  full_text?: string;
  source: string;
  created_at: string;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  page_size: number;
}

export interface DomainStats {
  domain: string;
  count: number;
}