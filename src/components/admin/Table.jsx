import React from 'react';
import { Eye } from 'lucide-react';

const Table = ({ data, columns, onToggleBlock, onViewDetails }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
      <table className="w-full bg-black text-white">
        <thead>
          <tr className="text-left border-b border-gray-700">
            {columns.map((column) => (
              <th key={column.key} className="p-4 font-mono font-medium text-[#00FF40]">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              className={`border-b border-gray-800 hover:bg-gray-800/50 transition-all duration-300 ${
                index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className="p-4 font-mono">
                  {column.key === 'is_blocked' ? (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!item[column.key]}
                        onChange={() => onToggleBlock(item.id, item[column.key])}
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#00FF40] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF40]"></div>
                    </label>
                  ) : column.key === 'actions' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewDetails(item.id)}
                        className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 text-white group relative"
                        aria-label="View Details"
                      >
                        <Eye size={18} />
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          View Details
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-white">{item[column.key] || 'N/A'}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;