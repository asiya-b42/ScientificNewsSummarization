import { Filter, X } from 'lucide-react';

interface FilterSidebarProps {
  selectedDomains: string[];
  onDomainChange: (domains: string[]) => void;
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  availableDomains: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  selectedDomains,
  onDomainChange,
  startDate,
  endDate,
  onDateChange,
  availableDomains,
  isOpen,
  onClose,
}: FilterSidebarProps) {
  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      onDomainChange(selectedDomains.filter((d) => d !== domain));
    } else {
      onDomainChange([...selectedDomains, domain]);
    }
  };

  const clearFilters = () => {
    onDomainChange([]);
    onDateChange('', '');
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky lg:top-[80px] left-0 h-screen lg:h-[calc(100vh-80px)] bg-white border-r border-gray-200 p-6 overflow-y-auto transition-transform duration-300 z-50 w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onDateChange(e.target.value, endDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onDateChange(startDate, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Scientific Domains</h3>
            <div className="space-y-2">
              {availableDomains.map((domain) => (
                <label
                  key={domain}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => toggleDomain(domain)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">{domain}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </aside>
    </>
  );
}