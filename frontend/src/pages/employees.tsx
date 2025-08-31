import React from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import EmployeeManagement from '../components/employees/EmployeeManagement';

const EmployeesPage: React.FC = () => {
  return (
    <ProtectedRoute resource="employees" action="read">
      <Layout>
        <EmployeeManagement />
      </Layout>
    </ProtectedRoute>
  );
};

export default EmployeesPage;
