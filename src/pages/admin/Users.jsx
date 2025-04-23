import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import Sidebar from '../../components/admin/Sidebar';
import { Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const BaseUrl = import.meta.env.VITE_API_BASE_URL;

const Users = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError('No access token found');
        return;
      }

      dispatch(setLoading({ isLoading: true, message: 'Fetching users...', style: 'compile' }));
      try {
        const response = await fetch(`${BaseUrl}/admin-panel/users_list/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch users: ${errorText}`);
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        dispatch(resetLoading());
      }
    };

    fetchUsers();
  }, [dispatch, token]);

  const handleToggleBlock = async (userId, isBlocked) => {
    dispatch(setLoading({ isLoading: true, message: 'Toggling block status...', style: 'battle' }));
    try {
      const response = await fetch(`${BaseUrl}/admin-panel/users/toggle-block/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle block: ${errorText}`);
      }

      const data = await response.json();
      setUsers(users.map(user =>
        user.id === userId ? { ...user, is_blocked: !isBlocked } : user
      ));
      toast.success(data.message || 'Block status updated!');
    } catch (error) {
      console.error('Error toggling block status:', error);
      setError(error.message);
      toast.error('Failed to toggle block status');
    } finally {
      dispatch(resetLoading());
    }
  };

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleViewDetails = (userId) => {
    console.log(`Viewing details for user ${userId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar onCollapseChange={handleCollapseChange} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        } p-8`}
      >
        <h1 className="text-2xl font-bold mb-6 text-white">User Management</h1>
        
        {error ? (
          <div className="p-4 bg-red-900 bg-opacity-20 rounded-md text-red-400">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 bg-gray-800 rounded-md">No users found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full bg-gray-900 text-white">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="p-4 font-mono font-medium">ID</th>
                  <th className="p-4 font-mono font-medium">Username</th>
                  <th className="p-4 font-mono font-medium">Email</th>
                  <th className="p-4 font-mono font-medium">Blocked</th>
                  <th className="p-4 font-mono font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'
                    }`}
                  >
                    <td className="p-4 font-mono">{user.id}</td>
                    <td className="p-4 font-mono">{user.username || 'N/A'}</td>
                    <td className="p-4 font-mono">{user.email}</td>
                    <td className="p-4 font-mono">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={!user.is_blocked}
                          onChange={() => handleToggleBlock(user.id, user.is_blocked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white group relative"
                          aria-label="View Details"
                        >
                          <Eye size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Details
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;