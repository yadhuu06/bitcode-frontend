import React, { useState } from 'react';
import { Eye, ArrowUp, ArrowDown, UserX, UserCheck } from 'lucide-react';
import PropTypes from 'prop-types';

const Table = ({ data, columns, onToggleBlock, onViewDetails, isLoading = false, statusFilter, setStatusFilter }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  // Filter data based on is_blocked (already filtered in Users.jsx, but kept for consistency)
  const filteredData = data;

  // Apply sorting to filtered data
  const sortedData = sortConfig.key ? handleSort(sortConfig.key) : filteredData;

  return (
    <div className="space-y-4">
      {/* Filter Dropdown */}
      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800/50 text-gray-200 text-sm rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-green-400 focus:outline-none px-3 py-2 font-sans"
          aria-label="Filter users by status"
        >
          <option value="all">All Users</option>
          <option value="blocked">Blocked Users</option>
          <option value="active">Active Users</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="relative rounded-xl shadow-2xl border border-green-500/30 bg-gray-900/40 backdrop-blur-xl overflow-x-auto">
        {/* Custom Scrollbar Styling */}
        <style>
          {`
            .overflow-x-auto::-webkit-scrollbar {
              height: 8px;
            }
            .overflow-x-auto::-webkit-scrollbar-track {
              background:rgb(0, 0, 0);
              border-radius: 8px;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb {
              background:rgb(32, 216, 0);
              border-radius: 8px;
            }
            .overflow-x-auto::-webkit-scrollbar-thumb:hover {
              background:rgb(32, 216, 0);
            }
          `}
        </style>
        <table className="w-full text-white">
          <thead>
            <tr className="text-left border-b border-green-500/40 bg-gradient-to-r from-gray-900 to-gray-800">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="p-6 font-semibold text-base text-gray-100 font-sans cursor-pointer hover:text-green-500 transition-colors duration-200"
                  onClick={() => column.key !== 'actions' && column.key !== 'is_blocked' && handleSort(column.key)}
                  role="columnheader"
                  aria-sort={
                    sortConfig.key === column.key
                      ? sortConfig.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortConfig.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={16} className="text-green-500" />
                      ) : (
                        <ArrowDown size={16} className="text-green-500" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-400 font-sans">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center text-gray-400 font-sans">
                  No data available.
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800/40 bg-gray-900/40 hover:bg-gray-800/60 hover:scale-[1.005] transition-all duration-300"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="p-6 font-sans text-sm text-gray-100">
                      {column.key === 'is_blocked' ? (
                        <div className="relative group">
                          <button
                            onClick={() => onToggleBlock(item.id, item[column.key])}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-md hover:shadow-[0_0_10px] hover:scale-105 ${
                              item[column.key]
                                ? 'bg-green-800/80 text-green-300 hover:shadow-green-500/50'
                                : 'bg-red-800/80 text-red-300 hover:shadow-red-500/50'
                            }`}
                            aria-label={item[column.key] ? 'Unblock user' : 'Block user'}
                          >
                            {item[column.key] ? (
                              <UserCheck size={18} />
                              
                            ) : (
                              <UserX size={18} />
                            )}
                          </button>
                          <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-sans">
                            {item[column.key] ? 'Unblock' : 'Block'}
                          </span>
                        </div>
                      ) : column.key === 'actions' ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewDetails(item.id)}
                            className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/80 hover:shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 text-gray-200 hover:text-green-400 group relative"
                            aria-label="View user details"
                          >
                            <Eye size={18} className="group-hover:animate-pulse" />
                            <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-sans">
                              View Details
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-100">{item[column.key] || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  onToggleBlock: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
};

export default Table;