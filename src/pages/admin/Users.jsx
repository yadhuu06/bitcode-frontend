import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import Table from '../../components/admin/Table';
import { toast } from 'react-toastify';
import api from '../../api';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, RefreshCw } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [emailSearch, setEmailSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const maxPageButtons = 5;
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      dispatch(setLoading({ isLoading: true, message: 'Fetching users...', style: 'compile' }));
      try {
        const response = await api.get('/admin-panel/users-list/');
        const rawUsers = response.data.users || [];

        const formattedUsers = rawUsers.map((user) => {
          const cleanedDate = user.created_at.split('.').length > 1
            ? user.created_at.split('.')[0] + user.created_at.slice(user.created_at.indexOf('+'))
            : user.created_at;
          
          const createdAt = new Date(cleanedDate);
          if (isNaN(createdAt.getTime())) {
            console.error(`Invalid date for user ${user.id}: ${user.created_at}`);
            return {
              ...user,
              joined: 'N/A',
            };
          }

          const options = {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          };
          const formattedDate = createdAt.toLocaleString('en-US', options);
          return {
            ...user,
            joined: formattedDate, 
          };
        });

        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching users:', error.message);
        setError(error.message || 'Failed to fetch users');
        toast.error('Failed to fetch users', { theme: 'dark' });
      } finally {
        setIsLoading(false);
        dispatch(resetLoading());
      }
    };

    fetchUsers();
  }, [dispatch]);


  useEffect(() => {
    let filtered = users;

    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(`${dateRange.start}T00:00:00Z`) : null;
      const endDate = dateRange.end ? new Date(`${dateRange.end}T23:59:59Z`) : null;

      filtered = filtered.filter((user) => {
        const cleanedDate = user.created_at.split('.').length > 1
          ? user.created_at.split('.')[0] + user.created_at.slice(user.created_at.indexOf('+'))
          : user.created_at;
        const createdAt = new Date(cleanedDate);
        if (isNaN(createdAt.getTime())) return false;
        if (startDate && createdAt < startDate) return false;
        if (endDate && createdAt > endDate) return false;
        return true;
      });
    }

    if (emailSearch) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(emailSearch.toLowerCase())
      );
    }

    if (statusFilter === 'blocked') {
      filtered = filtered.filter((user) => user.is_blocked);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter((user) => !user.is_blocked);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [dateRange, emailSearch, statusFilter, users]);

  const handleToggleBlock = async (userId, isBlocked) => {
    dispatch(setLoading({ isLoading: true, message: 'Toggling block status...', style: 'battle' }));
    try {
      const response = await api.post('/admin-panel/users/toggle-block/', {
        user_id: userId,
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_blocked: !isBlocked } : user
        )
      );
      setFilteredUsers(
        filteredUsers.map((user) =>
          user.id === userId ? { ...user, is_blocked: !isBlocked } : user
        )
      );
      toast.success(response.data.message || 'Block status updated!', { theme: 'dark' });
    } catch (error) {
      console.error('Error toggling block status:', error.message);
      setError(error.message || 'Failed to toggle block status');
      toast.error('Failed to toggle block status', { theme: 'dark' });
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleViewDetails = (userId) => {
    console.log(`Viewing details for user ${userId}`);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearDate = (field) => {
    setDateRange((prev) => ({ ...prev, [field]: '' }));
  };

  const handleEmailSearchChange = (e) => {
    setEmailSearch(e.target.value);
  };

  const handleClearEmailSearch = () => {
    setEmailSearch('');
  };

  const handleResetFilters = () => {
    setDateRange({ start: '', end: '' });
    setEmailSearch('');
    setStatusFilter('all');
  };

  // Pagination logic
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = Math.min(startIndex + usersPerPage, totalUsers);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  const usersDisplayed = paginatedUsers.length;
  const usersLeft = totalUsers - endIndex;


  const getPageNumbers = () => {
    const halfMax = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);


    const adjustedMaxPageButtons = window.innerWidth < 640 ? 3 : maxPageButtons; 
    if (endPage - startPage + 1 < adjustedMaxPageButtons) {
      startPage = Math.max(1, endPage - adjustedMaxPageButtons + 1);
    } else if (endPage - startPage + 1 > adjustedMaxPageButtons) {
      endPage = startPage + adjustedMaxPageButtons - 1;
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'is_blocked', label: 'Blocked' },
    { key: 'joined', label: 'Joined' },
    
  ];

  return (
    <div>
      {/* Heading and Date Filters in a Single Row */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold text-green-500 font-sans flex items-center gap-2">
          <span className="text-white">&lt;</span>
          User Management
          <span className="text-white">/&gt;</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <label className="block text-sm text-gray-200 font-sans mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="w-full bg-gray-800/50 text-gray-200 text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-400 focus:outline-none px-3 py-2 font-sans pr-8"
              />
              {dateRange.start && (
                <button
                  onClick={() => handleClearDate('start')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  aria-label="Clear start date"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-200 font-sans mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="w-full bg-gray-800/50 text-gray-200 text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-400 focus:outline-none px-3 py-2 font-sans pr-8"
              />
              {dateRange.end && (
                <button
                  onClick={() => handleClearDate('end')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                  aria-label="Clear end date"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Search and Reset Button */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="relative w-full sm:w-80">
          <label className="block text-sm text-gray-200 font-sans mb-1">Search by Email</label>
          <input
            type="text"
            value={emailSearch}
            onChange={handleEmailSearchChange}
            placeholder="Enter email..."
            className="w-full bg-gray-800/50 text-gray-200 text-sm rounded-lg border border-gray-700/50 focus:ring-2 focus:ring-green-400 focus:outline-none px-3 py-2 font-sans pr-8"
          />
          {emailSearch && (
            <button
              onClick={handleClearEmailSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors duration-200"
              aria-label="Clear email search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={handleResetFilters}
          className="p-2 bg-transparent text-gray-400 rounded-lg border border-gray-600 hover:text-green-400 transition-colors duration-200"
          title="Reset Filters"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700">
          {error}
        </div>
      ) : (
        <>
          {/* Table with horizontal scroll on small screens */}
          <div className="overflow-x-auto">
            <Table
              data={paginatedUsers}
              columns={columns}
              onToggleBlock={handleToggleBlock}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-2 mt-6">
              <div className="flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-200 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  aria-label="First page"
                >
                  <ChevronsLeft size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-200 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-sans transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-green-500 text-black shadow-md shadow-green-500/50'
                          : 'bg-gray-800/50 text-gray-200 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-green-500/30'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-200 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-200 hover:bg-gray-700/80 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  aria-label="Last page"
                >
                  <ChevronsRight size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-400 font-sans">
                Showing {usersDisplayed}/{totalUsers}, {usersLeft} left
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;