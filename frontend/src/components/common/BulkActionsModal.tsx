import React, { useState } from 'react';
import Modal from '../common/Modal';
import { 
  XMarkIcon, 
  UserGroupIcon, 
  TrashIcon, 
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onBulkDelete: () => Promise<void>;
  onBulkStatusUpdate: (status: string) => Promise<void>;
  loading?: boolean;
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onBulkDelete,
  onBulkStatusUpdate,
  loading = false,
}) => {
  const [actionType, setActionType] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState(false);

  const handleActionSelect = (action: string) => {
    setActionType(action);
    setConfirmStep(true);
  };

  const handleConfirm = async () => {
    try {
      if (actionType === 'delete') {
        await onBulkDelete();
      } else if (actionType.startsWith('status:')) {
        const status = actionType.replace('status:', '');
        await onBulkStatusUpdate(status);
      }
      onClose();
      setConfirmStep(false);
      setActionType('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleCancel = () => {
    setConfirmStep(false);
    setActionType('');
  };

  const getActionDetails = () => {
    switch (actionType) {
      case 'delete':
        return {
          title: 'Delete Users',
          message: `Are you sure you want to delete ${selectedCount} selected user${selectedCount !== 1 ? 's' : ''}? This action cannot be undone.`,
          confirmText: 'Delete Users',
          type: 'danger' as const,
          icon: TrashIcon,
        };
      case 'status:active':
        return {
          title: 'Activate Users',
          message: `This will activate ${selectedCount} selected user${selectedCount !== 1 ? 's' : ''}.`,
          confirmText: 'Activate Users',
          type: 'success' as const,
          icon: CheckIcon,
        };
      case 'status:inactive':
        return {
          title: 'Deactivate Users',
          message: `This will deactivate ${selectedCount} selected user${selectedCount !== 1 ? 's' : ''}.`,
          confirmText: 'Deactivate Users',
          type: 'warning' as const,
          icon: XCircleIcon,
        };
      case 'status:suspended':
        return {
          title: 'Suspend Users',
          message: `This will suspend ${selectedCount} selected user${selectedCount !== 1 ? 's' : ''}.`,
          confirmText: 'Suspend Users',
          type: 'danger' as const,
          icon: PauseIcon,
        };
      default:
        return null;
    }
  };

  const actionDetails = getActionDetails();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {confirmStep ? actionDetails?.title : 'Bulk Actions'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!confirmStep ? (
            <div className="space-y-6">
              <p className="text-gray-700">
                You have selected <span className="font-semibold">{selectedCount}</span> user{selectedCount !== 1 ? 's' : ''}. 
                Choose an action to perform on all selected users:
              </p>

              <div className="space-y-3">
                {/* Status Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Status Actions</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleActionSelect('status:active')}
                      className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                    >
                      <CheckIcon className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">Activate Users</div>
                        <div className="text-sm text-gray-500">Set status to active</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionSelect('status:inactive')}
                      className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-gray-900">Deactivate Users</div>
                        <div className="text-sm text-gray-500">Set status to inactive</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleActionSelect('status:suspended')}
                      className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      <PauseIcon className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-gray-900">Suspend Users</div>
                        <div className="text-sm text-gray-500">Set status to suspended</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Destructive Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Destructive Actions</h3>
                  <button
                    onClick={() => handleActionSelect('delete')}
                    className="flex items-center gap-3 p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors w-full"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">Delete Users</div>
                      <div className="text-sm text-red-600">Permanently remove selected users</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {actionDetails && (
                <>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${
                      actionDetails.type === 'danger' ? 'bg-red-50' :
                      actionDetails.type === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
                    }`}>
                      <actionDetails.icon className={`w-6 h-6 ${
                        actionDetails.type === 'danger' ? 'text-red-600' :
                        actionDetails.type === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{actionDetails.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-700">{actionDetails.message}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={confirmStep ? handleCancel : onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmStep ? 'Back' : 'Cancel'}
          </button>
          
          {confirmStep && actionDetails && (
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                actionDetails.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                actionDetails.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Processing...' : actionDetails.confirmText}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BulkActionsModal;
