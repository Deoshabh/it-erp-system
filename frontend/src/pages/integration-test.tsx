import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../components/layout/Layout';
import SystemIntegrationTest from '../components/SystemIntegrationTest';

const IntegrationTestPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <SystemIntegrationTest />
        </div>
      </div>
    </Layout>
  );
};

export default IntegrationTestPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check authentication if needed
  return {
    props: {}
  };
};
