import { Article, ArticlesResponse, DomainStats } from '../types/article';

const API_BASE_URL = 'http://localhost:8000';

export interface FetchArticlesParams {
  startDate?: string;
  endDate?: string;
  domains?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
}

export const fetchArticles = async (params: FetchArticlesParams = {}): Promise<ArticlesResponse> => {
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append('start_date', params.startDate);
  if (params.endDate) queryParams.append('end_date', params.endDate);
  if (params.domains && params.domains.length > 0) {
    queryParams.append('domains', params.domains.join(','));
  }
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());

  const response = await fetch(`${API_BASE_URL}/articles?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }

  return response.json();
};

export const fetchDomainStats = async (): Promise<DomainStats[]> => {
  const response = await fetch(`${API_BASE_URL}/domains`);
  if (!response.ok) {
    throw new Error('Failed to fetch domain statistics');
  }

  return response.json();
};

export const refreshFeed = async (): Promise<{ status: string; message: string; new_articles: number }> => {
  const response = await fetch(`${API_BASE_URL}/refresh`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to refresh feed');
  }

  return response.json();
};

export const getRefreshStatus = async (): Promise<{ is_refreshing: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/refresh/status`);
  if (!response.ok) {
    throw new Error('Failed to get refresh status');
  }

  return response.json();
};