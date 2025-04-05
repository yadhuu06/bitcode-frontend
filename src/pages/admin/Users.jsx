import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';

const BaseUrl='http://127.0.0.1:8000/'
const Users = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => { 
      try {
        const response = await fetch('{BaseUrl}', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div style={{ backgroundColor: '#000000', color: 'white', minHeight: '100vh' }}>
      <Sidebar onCollapseChange={handleCollapseChange} />
      <div
        style={{
          marginLeft: isSidebarCollapsed ? '4rem' : '16rem',
          padding: '2rem',
          height: '100%',
          transition: 'margin-left 0.3s',
          backgroundColor: '#000000',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>User Listing</h1>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#1a1a1a',
                color: 'white',
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Username</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>{user.id}</td>
                    <td style={tableCellStyle}>{user.username}</td>
                    <td style={tableCellStyle}>{user.email}</td>
                    <td style={tableCellStyle}>{user.role}</td>
                    <td style={tableCellStyle}>
                      <button
                        style={actionButtonStyle}
                        onMouseOver={(e) => (e.target.style.boxShadow = '0 0 10px rgba(115, 230, 0, 0.3)')}
                        onMouseOut={(e) => (e.target.style.boxShadow = 'none')}
                      >
                        Edit
                      </button>
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

const tableHeaderStyle = {
  padding: '1rem',
  textAlign: 'left',
  borderBottom: '2px solid #73E600',
  fontFamily: "'Fira Code', monospace",
};

const tableRowStyle = {
  borderBottom: '1px solid #333',
};

const tableCellStyle = {
  padding: '1rem',
  fontFamily: "'Fira Code', monospace",
};

const actionButtonStyle = {
  backgroundColor: '#73E600',
  color: '#000000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'box-shadow 0.3s',
  fontFamily: "'Fira Code', monospace",
};

export default Users;