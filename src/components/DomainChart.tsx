import { DomainStats } from '../types/article';
import { BarChart3 } from 'lucide-react';

interface DomainChartProps {
  stats: DomainStats[];
}

const domainColors: Record<string, string> = {
  'Physics': 'bg-blue-500',
  'Biology': 'bg-green-500',
  'Astronomy': 'bg-purple-500',
  'AI': 'bg-orange-500',
  'Medicine': 'bg-red-500',
  'Chemistry': 'bg-yellow-500',
  'Earth Science': 'bg-teal-500',
  'Technology': 'bg-gray-500',
  'Neuroscience': 'bg-pink-500',
  'Agriculture': 'bg-amber-500',
  'General Science': 'bg-slate-500',
};

export default function DomainChart({ stats }: DomainChartProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const maxCount = Math.max(...stats.map((s) => s.count));
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Articles by Domain
          </h2>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-full transition-colors duration-300">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{totalCount} Total</span>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = ((stat.count / totalCount) * 100).toFixed(1);
          const barWidth = (stat.count / maxCount) * 100;
          const colorClass = domainColors[stat.domain] || 'bg-gray-500';

          return (
            <div key={stat.domain} className="group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{stat.domain}</span>
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {stat.count} <span className="text-gray-500 dark:text-gray-400">({percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`${colorClass} h-full rounded-full transition-all duration-700 group-hover:shadow-lg`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}