import React from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import UserManagement from '../components/users/UserManagement';

const UsersPage: React.FC = () => {
  return (
    <ProtectedRoute resource="users" action="read">
      <Layout>
        <UserManagement />
      </Layout>
    </ProtectedRoute>
  );
};

export default UsersPage;
