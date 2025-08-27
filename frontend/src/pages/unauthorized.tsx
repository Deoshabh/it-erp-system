import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="text-6xl text-red-500 mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        {user && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <strong>Your Role:</strong> {user.role}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Department:</strong> {user.department}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
