import { useEffect } from 'react';
import { Article } from '../types/article';
import { X, ExternalLink, Calendar, Tag } from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

const domainColors: Record<string, string> = {
  'Physics': 'bg-blue-100 text-blue-800',
  'Biology': 'bg-green-100 text-green-800',
  'Astronomy': 'bg-purple-100 text-purple-800',
  'AI': 'bg-orange-100 text-orange-800',
  'Medicine': 'bg-red-100 text-red-800',
  'Chemistry': 'bg-yellow-100 text-yellow-800',
  'Earth Science': 'bg-teal-100 text-teal-800',
  'Technology': 'bg-gray-100 text-gray-800',
  'Neuroscience': 'bg-pink-100 text-pink-800',
  'Agriculture': 'bg-amber-100 text-amber-800',
  'General Science': 'bg-slate-100 text-slate-800',
};

export default function ArticleModal({ article, isOpen, onClose }: ArticleModalProps) {
  if (!isOpen || !article) return null;

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const domainColorClass = domainColors[article.domain] || 'bg-gray-100 text-gray-800';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${domainColorClass}`}>
                <Tag className="w-3 h-3 mr-1" />
                {article.domain}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(article.published_date)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h2>

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Source: {article.source}</span>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Read Original Article
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{article.summary}</p>

              {article.full_text && article.full_text.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Full Article Text</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {article.full_text}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}