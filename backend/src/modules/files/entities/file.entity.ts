import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  relatedEntityType: string; // 'employee', 'invoice', 'project', etc.

  @Column({ nullable: true })
  relatedEntityId: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
