import { apiClient } from './apiClient';

export interface FileUploadResponse {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  uploadedAt: string;
}

export interface FileEntity {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  uploadedAt: string;
}

// Mock data for demo purposes
let mockFiles: FileEntity[] = [
  {
    id: '1',
    originalName: 'employee_handbook.pdf',
    filename: 'emp_handbook_2024.pdf',
    path: '/uploads/emp_handbook_2024.pdf',
    mimetype: 'application/pdf',
    size: 2048576,
    category: 'documents',
    relatedEntityType: 'employee',
    relatedEntityId: '1',
    uploadedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: '2',
    originalName: 'company_logo.png',
    filename: 'logo_company_2024.png',
    path: '/uploads/logo_company_2024.png',
    mimetype: 'image/png',
    size: 125678,
    category: 'images',
    uploadedAt: '2024-08-10T14:20:00Z'
  }
];

class FileService {
  private baseUrl = '/api/v1/files';
  private useMockData = true; // Set to false when backend is ready

  async uploadFile(
    file: File,
    category?: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<FileUploadResponse> {
    if (this.useMockData) {
      const newFile: FileEntity = {
        id: (mockFiles.length + 1).toString(),
        originalName: file.name,
        filename: `${Date.now()}_${file.name}`,
        path: `/uploads/${Date.now()}_${file.name}`,
        mimetype: file.type,
        size: file.size,
        category,
        relatedEntityType,
        relatedEntityId,
        uploadedAt: new Date().toISOString()
      };
      mockFiles.push(newFile);
      return Promise.resolve(newFile);
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (category) formData.append('category', category);
    if (relatedEntityType) formData.append('relatedEntityType', relatedEntityType);
    if (relatedEntityId) formData.append('relatedEntityId', relatedEntityId);

    const response = await apiClient.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getAllFiles(): Promise<{ data: FileEntity[] }> {
    if (this.useMockData) {
      return Promise.resolve({ data: [...mockFiles] });
    }

    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string
  ): Promise<{ data: FileEntity[] }> {
    if (this.useMockData) {
      const filtered = mockFiles.filter(f => 
        f.relatedEntityType === entityType && f.relatedEntityId === entityId
      );
      return Promise.resolve({ data: filtered });
    }

    const response = await apiClient.get(
      `${this.baseUrl}/by-entity/${entityType}/${entityId}`
    );
    return response.data;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    if (this.useMockData) {
      // Create a mock blob for demo
      const content = `Mock file content for file ID: ${fileId}`;
      return Promise.resolve(new Blob([content], { type: 'text/plain' }));
    }

    const response = await apiClient.get(`${this.baseUrl}/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    if (this.useMockData) {
      const index = mockFiles.findIndex(f => f.id === fileId);
      if (index !== -1) {
        mockFiles.splice(index, 1);
      }
      return Promise.resolve();
    }

    await apiClient.delete(`${this.baseUrl}/${fileId}`);
  }

  // Utility method to trigger download in browser
  async triggerDownload(fileId: string, filename: string): Promise<void> {
    try {
      const blob = await this.downloadFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  // Get file type icon class
  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'text-green-500';
    if (mimetype === 'application/pdf') return 'text-red-500';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'text-blue-500';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'text-green-600';
    return 'text-gray-500';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type display name
  getFileTypeDisplay(mimetype: string): string {
    const typeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'text/plain': 'Text File',
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
    };

    return typeMap[mimetype] || 'Unknown File Type';
  }
}

export const fileService = new FileService();
