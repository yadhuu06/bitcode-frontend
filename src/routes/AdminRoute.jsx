
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const accessToken = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('role'); 


  if (!accessToken) {
    return <Navigate to="/" replace />;
  }


  if (userRole !== 'admin') {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default AdminRoute;