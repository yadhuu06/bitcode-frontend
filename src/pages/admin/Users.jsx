import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, resetLoading } from '../../store/slices/loadingSlice';
import Sidebar from '../../components/admin/Sidebar';
import Table from '../../components/admin/Table';
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
            Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to toggle block: ${errorText}`);
      }

      const data = await response.json();
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_blocked: !isBlocked } : user
        )
      );
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

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'is_blocked', label: 'Blocked' },
    { key: 'actions', label: 'Actions' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar onCollapseChange={handleCollapseChange} />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        } p-8`}
      >
        <h1 className="text-2xl font-bold mb-6 text-[#00FF40] font-mono">
          User Management
        </h1>

        {error ? (
          <div className="p-4 bg-red-900/20 rounded-md text-red-400 border border-red-700">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 bg-gray-800/50 rounded-md text-white border border-gray-700">
            No users found.
          </div>
        ) : (
          <Table
            data={users}
            columns={columns}
            onToggleBlock={handleToggleBlock}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
};

export default Users;