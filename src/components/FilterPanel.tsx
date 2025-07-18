import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Download, RotateCcw, Search } from 'lucide-react';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: () => void;
  onRestart: () => void;
  totalPackets: number;
  filteredCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onExport,
  onRestart,
  totalPackets,
  filteredCount
}) => {
  const protocols = ['All', 'HTTP', 'HTTPS', 'TCP', 'UDP', 'DNS', 'ARP', 'ICMP'];
  const timeRanges = ['All Time', 'Last 5 min', 'Last 15 min', 'Last 1 hour'];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Filter className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Traffic Filters</h3>
            <p className="text-sm text-slate-400">
              Showing {filteredCount} of {totalPackets} packets
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onRestart}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-lg transition-colors text-orange-400 hover:text-orange-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg transition-colors text-green-400 hover:text-green-300"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Protocol Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Protocol
          </label>
          <select
            value={filters.protocol}
            onChange={(e) => handleFilterChange('protocol', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            {protocols.map(protocol => (
              <option key={protocol} value={protocol === 'All' ? '' : protocol}>
                {protocol}
              </option>
            ))}
          </select>
        </div>

        {/* Source IP Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Source IP
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.sourceIp}
              onChange={(e) => handleFilterChange('sourceIp', e.target.value)}
              placeholder="192.168.1.1"
              className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Destination IP Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Destination IP
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filters.destinationIp}
              onChange={(e) => handleFilterChange('destinationIp', e.target.value)}
              placeholder="192.168.1.1"
              className="w-full pl-10 pr-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Time Range
          </label>
          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          >
            {timeRanges.map(range => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel;