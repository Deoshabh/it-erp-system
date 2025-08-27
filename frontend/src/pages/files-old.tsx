import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { fileService } from '../services/fileService';
import { formatCurrency } from '../utils/currency';
import {
  DocumentIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FolderIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

interface FileRecord {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  path?: string;
}

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual API call
      const mockData: FileRecord[] = [
        {
          id: '1',
          filename: 'employee_handbook_2025.pdf',
          originalName: 'Employee Handbook 2025.pdf',
          mimetype: 'application/pdf',
          size: 2048576,
          uploadedAt: '2025-08-27T10:30:00Z',
          category: 'hr_documents',
          relatedEntityType: 'employee',
          relatedEntityId: '1',
        },
        {
          id: '2',
          filename: 'quarterly_report_q3.xlsx',
          originalName: 'Quarterly Report Q3.xlsx',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1024000,
          uploadedAt: '2025-08-26T15:45:00Z',
          category: 'finance_reports',
          relatedEntityType: 'finance',
          relatedEntityId: '1',
        },
        {
          id: '3',
          filename: 'company_logo.png',
          originalName: 'Company Logo.png',
          mimetype: 'image/png',
          size: 512000,
          uploadedAt: '2025-08-25T09:20:00Z',
          category: 'marketing',
        }
      ];
      setFiles(mockData);
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await fileService.uploadFile(selectedFile);
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      fetchFiles();
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileService.deleteFile(id);
        fetchFiles();
      } catch (err) {
        setError('Failed to delete file');
        console.error('Error deleting file:', err);
      }
    }
  };

  const handleFileDownload = async (id: string, filename: string) => {
    try {
      await fileService.triggerDownload(id, filename);
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📈';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('zip') || mimetype.includes('archive')) return '📦';
    return '📎';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">File Management</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* File Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload New File</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={uploading}
              />
            </div>
            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className={`py-2 px-4 rounded-md font-medium ${
                  selectedFile && !uploading
                    ? 'bg-blue-500 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        </div>

        {/* Files Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Files</h3>
            <p className="text-2xl font-bold text-blue-900">{files.length}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Total Size</h3>
            <p className="text-2xl font-bold text-green-900">
              {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">File Types</h3>
            <p className="text-2xl font-bold text-purple-900">
              {new Set(files.map(file => file.mimetype.split('/')[0])).size}
            </p>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Associated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getFileIcon(file.mimetype)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.originalName}</div>
                        <div className="text-sm text-gray-500">{file.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{file.mimetype}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatFileSize(file.size)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {file.relatedEntityType && <span className={`px-2 py-1 rounded-full text-xs ${
                        file.relatedEntityType === 'employee' ? 'bg-blue-100 text-blue-800' :
                        file.relatedEntityType === 'invoice' ? 'bg-green-100 text-green-800' :
                        file.relatedEntityType === 'expense' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {file.relatedEntityType.charAt(0).toUpperCase() + file.relatedEntityType.slice(1)}
                      </span>}
                      {!file.relatedEntityType && 
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">None</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleFileDownload(file.id, file.originalName)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {files.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No files found. Upload your first file!
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FilesPage;
