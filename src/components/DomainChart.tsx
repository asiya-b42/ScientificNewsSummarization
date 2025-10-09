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
  'General Science': 'bg-slate-500',
};

export default function DomainChart({ stats }: DomainChartProps) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const maxCount = Math.max(...stats.map((s) => s.count));
  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-5 h-5 mr-2 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">Articles by Domain</h2>
      </div>

      <div className="space-y-4">
        {stats.map((stat) => {
          const percentage = ((stat.count / totalCount) * 100).toFixed(1);
          const barWidth = (stat.count / maxCount) * 100;
          const colorClass = domainColors[stat.domain] || 'bg-gray-500';

          return (
            <div key={stat.domain}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{stat.domain}</span>
                <span className="text-sm text-gray-500">
                  {stat.count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Total Articles</span>
          <span className="text-lg font-bold text-gray-900">{totalCount}</span>
        </div>
      </div>
    </div>
  );
}