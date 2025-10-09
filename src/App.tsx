import { useState, useEffect } from 'react';
import { Search, RefreshCw, Menu, Newspaper, Loader2 } from 'lucide-react';
import ArticleCard from './components/ArticleCard';
import FilterSidebar from './components/FilterSidebar';
import ArticleModal from './components/ArticleModal';
import DomainChart from './components/DomainChart';
import { Article, DomainStats } from './types/article';
import { fetchArticles, fetchDomainStats, refreshFeed, getRefreshStatus } from './services/api';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [domainStats, setDomainStats] = useState<DomainStats[]>([]);
  const [page, setPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  const availableDomains = [
    'Physics',
    'Biology',
    'Astronomy',
    'AI',
    'Medicine',
    'Chemistry',
    'Earth Science',
    'Technology',
    'Neuroscience',
    'General Science',
  ];

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchArticles({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        domains: selectedDomains.length > 0 ? selectedDomains : undefined,
        search: searchQuery || undefined,
        page,
        pageSize: 20,
      });

      setArticles(response.articles);
      setTotalArticles(response.total);
    } catch (err) {
      setError('Failed to load articles. Please make sure the backend server is running on port 8000.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDomainStats = async () => {
    try {
      const stats = await fetchDomainStats();
      setDomainStats(stats);
    } catch (err) {
      console.error('Failed to load domain statistics:', err);
    }
  };

  useEffect(() => {
    loadArticles();
    loadDomainStats();
  }, [selectedDomains, startDate, endDate, page]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (page === 1) {
        loadArticles();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshFeed();

      const checkStatus = setInterval(async () => {
        const status = await getRefreshStatus();
        if (!status.is_refreshing) {
          clearInterval(checkStatus);
          setIsRefreshing(false);
          loadArticles();
          loadDomainStats();
        }
      }, 2000);
    } catch (err) {
      setIsRefreshing(false);
      console.error('Failed to refresh feed:', err);
    }
  };

  const openArticleModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1);
  };

  const handleDomainChange = (domains: string[]) => {
    setSelectedDomains(domains);
    setPage(1);
  };

  const totalPages = Math.ceil(totalArticles / 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <Newspaper className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Scientific News Summarizer</h1>
                <p className="text-sm text-gray-600">AI-powered summaries of the latest research</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 mr-2" />
              )}
              {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <FilterSidebar
          selectedDomains={selectedDomains}
          onDomainChange={handleDomainChange}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
          availableDomains={availableDomains}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles by title or summary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
              </div>
            </div>

            {domainStats.length > 0 && (
              <div className="mb-6">
                <DomainChart stats={domainStats} />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Make sure to start the backend server: <code>cd backend && python main.py</code>
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Articles Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedDomains.length > 0 || startDate || endDate
                    ? 'Try adjusting your filters or search terms.'
                    : 'Click "Refresh Feed" to fetch the latest scientific news.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={() => openArticleModal(article)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedArticle(null);
        }}
      />
    </div>
  );
}

export default App;