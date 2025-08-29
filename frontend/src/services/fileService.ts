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

export interface FileStats {
  totalFiles: number;
  totalStorage: number;
  categories: { [key: string]: number };
}

class FileService {
  private baseUrl = '/files';

  async uploadFile(
    file: File,
    category?: string,
    relatedEntityType?: string,
    relatedEntityId?: string
  ): Promise<FileUploadResponse> {
    try {
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
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getAllFiles(): Promise<FileEntity[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }

  async getFilesByEntity(
    entityType: string,
    entityId: string
  ): Promise<FileEntity[]> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/by-entity/${entityType}/${entityId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching files by entity:', error);
      return [];
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${fileId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${fileId}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getFileStats(): Promise<FileStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching file stats:', error);
      return {
        totalFiles: 0,
        totalStorage: 0,
        categories: {},
      };
    }
  }

  // Helper methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📋';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    return '📎';
  }

  async createFolder(name: string, parentId?: string): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/folders`, {
        name,
        parentId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async getFolders(): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/folders`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
  }
}

export const fileService = new FileService();
