import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import usersService, { User, CreateUserDto, UpdateUserDto, UserSearchFilters } from '../../services/usersService';
import UserForm from './UserForm';
import UserTable from './UserTable';
import UserFilters from './UserFilters';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import BulkActionsModal from '../common/BulkActionsModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface UserManagementProps {
  initialFilters?: Partial<UserSearchFilters>;
}

const UserManagement: React.FC<UserManagementProps> = ({ initialFilters }) => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Selected data
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserSearchFilters>({
    search: '',
    role: '',
    status: '',
    department: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...initialFilters,
  });

  // API Functions
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await usersService.searchUsers(filters);
      
      setUsers(result.data || []);
      setTotalCount(result.total || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleCreateUser = async (userData: CreateUserDto) => {
    try {
      const result = await usersService.create(userData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleCreateSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    await handleCreateUser(data as CreateUserDto);
  };

  const handleUpdateSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      await handleUpdateUser(selectedUser.id, data as UpdateUserDto);
    }
  };

  const handleUpdateUser = async (id: string, userData: UpdateUserDto) => {
    try {
      const result = await usersService.update(id, userData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await usersService.delete(id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleBulkDelete = async (userIds: string[]) => {
    try {
      await usersService.bulkDelete(userIds);
      toast.success(`${userIds.length} users deleted successfully`);
      setShowBulkModal(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete users');
    }
  };

  const handleBulkStatusUpdate = async (userIds: string[], status: string) => {
    try {
      await usersService.bulkUpdateStatus(userIds, status as User['status']);
      toast.success(`${userIds.length} users status updated successfully`);
      setShowBulkModal(false);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update users status');
    }
  };

  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({
      ...prev,
      search: term,
      page: 1,
    }));
  };

  // Filter handlers
  const handleFiltersChange = (newFilters: Partial<UserSearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'ASC' | 'DESC') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  // Selection handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length 
        ? [] 
        : users.map(user => user.id)
    );
  };

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
          
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              Bulk Actions ({selectedUsers.length})
            </button>
          )}

          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <UserFilters
          filters={{
            search: filters.search || '',
            role: filters.role || '',
            department: filters.department || '',
            status: filters.status || ''
          }}
          onFiltersChange={(newFilters) => handleFiltersChange({
            search: newFilters.search,
            role: newFilters.role,
            department: newFilters.department,
            status: newFilters.status
          })}
          onClearFilters={() => handleFiltersChange({ search: '', role: '', department: '', status: '' })}
          departments={Array.from(new Set(users.map(user => user.department)))}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* User Table */}
      <UserTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onUserSelect={handleSelectUser}
        onSelectAll={handleSelectAll}
        onEdit={(user) => {
          setSelectedUser(user);
          setShowEditModal(true);
        }}
        onDelete={(user) => {
          setSelectedUser(user);
          setShowDeleteModal(true);
        }}
        onView={(user) => {
          // Add view functionality if needed
        }}
      />

      {/* Modals */}
      {showCreateModal && (
        <UserForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
          title="Create New User"
        />
      )}

      {showEditModal && selectedUser && (
        <UserForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={selectedUser}
          title="Edit User"
          isEdit
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          title="Delete User"
          message={`Are you sure you want to delete user "${selectedUser.firstName} ${selectedUser.lastName}"? This action cannot be undone.`}
        />
      )}

      {showBulkModal && (
        <BulkActionsModal
          isOpen={showBulkModal}
          onClose={() => {
            setShowBulkModal(false);
            setSelectedUsers([]);
          }}
          selectedCount={selectedUsers.length}
          onBulkDelete={() => handleBulkDelete(selectedUsers)}
          onBulkStatusUpdate={(status) => handleBulkStatusUpdate(selectedUsers, status)}
        />
      )}
    </div>
  );
};

export default UserManagement;
