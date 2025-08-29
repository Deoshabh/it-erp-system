import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectController } from './controllers/project.controller';
import { TaskController } from './controllers/task.controller';
import { ProjectService } from './services/project.service';
import { TaskService } from './services/task.service';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Task]),
    UsersModule,
  ],
  controllers: [ProjectController, TaskController],
  providers: [ProjectService, TaskService],
  exports: [ProjectService, TaskService],
})
export class ProjectsModule {}
