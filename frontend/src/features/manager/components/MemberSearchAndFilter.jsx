import React from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
import { statusOptions } from '../data/memberData';
import { formatStatusText } from '../utils/memberUtils';

/**
 * Search and filter controls for member list
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search term
 * @param {Function} props.onSearchChange - Search change handler
 * @param {string} props.filterStatus - Current filter status
 * @param {Function} props.onFilterChange - Filter change handler
 */
const MemberSearchAndFilter = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange
}) => {
  return (
    <section className="mb-6 space-y-3" aria-label="Member search and filter controls">
      {/* Search Input */}
      <div className="relative">
        <SearchIcon 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Search members by name or email"
        />
      </div>
      
      {/* Status Filter Buttons */}
      <div className="flex space-x-2" role="group" aria-label="Filter members by status">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={filterStatus === status}
            aria-label={`Filter by ${formatStatusText(status)} status`}
          >
            {status === 'all' ? 'All' : formatStatusText(status)}
          </button>
        ))}
      </div>
    </section>
  );
};

export default MemberSearchAndFilter;
