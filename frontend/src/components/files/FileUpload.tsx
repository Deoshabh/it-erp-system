import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileUpload: (file: File, category?: string, relatedEntityType?: string, relatedEntityId?: string) => Promise<void>;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  multiple?: boolean;
}

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
  uploadedAt: string;
  category?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  maxSize = 10, // 10MB default
  category,
  relatedEntityType,
  relatedEntityId,
  multiple = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!multiple && files.length > 1) {
      alert('Only one file is allowed');
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB`);
          continue;
        }

        // Validate file type
        const isValidType = acceptedTypes.some(type => {
          if (type.includes('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type || file.name.endsWith(type);
        });

        if (!isValidType) {
          alert(`File ${file.name} is not an accepted file type`);
          continue;
        }

        await onFileUpload(file, category, relatedEntityType, relatedEntityId);
        
        // Add to uploaded files list (mock data for now)
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category,
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file(s)');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept={acceptedTypes.join(',')}
          multiple={multiple}
        />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                Click to upload
              </span>{' '}
              or drag and drop
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">
          {acceptedTypes.includes('image/*') && 'Images, '}
          PDF, DOC, DOCX, XLS, XLSX, TXT up to {maxSize}MB
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-white p-2 rounded border"
              >
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      {file.category && ` • ${file.category}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-blue-600">Uploading files...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
