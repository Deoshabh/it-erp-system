import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async saveFile(
    file: Express.Multer.File,
    category?: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
  ): Promise<FileEntity> {
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      category,
      relatedEntityType,
      relatedEntityId,
    });

    return await this.fileRepository.save(fileEntity);
  }

  async findAll(): Promise<FileEntity[]> {
    return await this.fileRepository.find({
      order: { uploadedAt: 'DESC' },
    });
  }

  async findByRelatedEntity(entityType: string, entityId: string): Promise<FileEntity[]> {
    return await this.fileRepository.find({
      where: {
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FileEntity> {
    return await this.fileRepository.findOne({ where: { id } });
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.findOne(id);
    if (file) {
      // Delete physical file
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
      
      // Delete from database
      await this.fileRepository.delete(id);
    }
  }

  getFileStream(filePath: string): fs.ReadStream {
    return fs.createReadStream(filePath);
  }
}
