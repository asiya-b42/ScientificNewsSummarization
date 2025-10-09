import { Article } from '../types/article';
import { ExternalLink, Calendar, Tag } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
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
  'General Science': 'bg-slate-100 text-slate-800',
};

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const domainColorClass = domainColors[article.domain] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${domainColorClass}`}>
          <Tag className="w-3 h-3 mr-1" />
          {article.domain}
        </span>
        <span className="text-xs text-gray-500 flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(article.published_date)}
        </span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
        {article.title}
      </h3>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.summary}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500 font-medium">{article.source}</span>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Read Original
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}