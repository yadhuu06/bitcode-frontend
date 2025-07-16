import React from 'react';
import { Search } from 'lucide-react';

const RoomFilter = ({ searchTerm, onSearchChange, activeFilter, onFilterChange }) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" size={20} />
        <input
          type="text"
          placeholder="Search rooms by name, host, or join code.."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-3 pl-10 bg-gray-900/90 border border-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/50 transition-all duration-300 backdrop-blur-sm"
          aria-label="Search rooms"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {['active', 'all', 'public', 'private', 'ranked', 'casual'].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 rounded-md text-sm transition-all duration-300 border
              ${activeFilter === filter
                ? 'bg-transparent text-white border-[#00ff73]'
                : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-800/90 hover:border-gray-600 hover:text-[#00ff73]'
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomFilter;