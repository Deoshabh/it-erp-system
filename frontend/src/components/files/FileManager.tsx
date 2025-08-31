import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { fileService, FileEntity } from '@/services/fileService';
import {
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface FileManagerProps {
  entityType?: string; // 'employee', 'invoice', 'expense', etc.
  entityId?: string;
  category?: string;
  allowUpload?: boolean;
  showEntityFilter?: boolean;
}

export const FileManager: React.FC<FileManagerProps> = ({
  entityType,
  entityId,
  category,
  allowUpload = true,
  showEntityFilter = false,
}) => {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [entityType, entityId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (entityType && entityId) {
        response = await fileService.getFilesByEntity(entityType, entityId);
      } else {
        response = await fileService.getAllFiles();
      }

      setFiles(response || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    uploadCategory?: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ) => {
    try {
      await fileService.uploadFile(
        file,
        uploadCategory || category,
        relatedEntityType || entityType,
        relatedEntityId || entityId
      );
      
      // Reload files after upload
      await loadFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload file');
    }
  };

  const handleDownload = async (file: FileEntity) => {
    try {
      // Create a simple download trigger
      window.open(`/api/files/${file.id}/download`, '_blank');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = async (file: FileEntity) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      await loadFiles(); // Reload files after deletion
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file');
    }
  };

  const filteredFiles = files.filter(file => {
    if (category && file.category !== category) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {allowUpload && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Upload Files
          </h3>
          <FileUpload
            onFileUpload={handleFileUpload}
            category={category}
            relatedEntityType={entityType}
            relatedEntityId={entityId}
            multiple={true}
          />
        </div>
      )}

      {/* Files List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Files {entityType && entityId && `for ${entityType}`}
            </h3>
            <span className="text-sm text-gray-500">
              {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-gray-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
            <p className="mt-1 text-sm text-gray-500">
              {allowUpload ? 'Get started by uploading a file.' : 'No files have been uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFiles.map((file) => (
              <div key={file.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${fileService.getFileIcon(file.mimetype)}`}>
                      <DocumentIcon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{file.mimetype}</span>
                        <span>•</span>
                        <span>{fileService.formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        {file.category && (
                          <>
                            <span>•</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {file.category}
                            </span>
                          </>
                        )}
                      </div>
                      {showEntityFilter && file.relatedEntityType && (
                        <p className="text-xs text-blue-600">
                          Related to {file.relatedEntityType}: {file.relatedEntityId}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
