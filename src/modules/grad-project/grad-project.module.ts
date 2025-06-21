import { Module } from '@nestjs/common';
import { GradProjectService } from './grad-project.service';
import { GradProjectController } from './grad-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entites/course.entity';
import { Program } from '../program/entities/program.entitiy';
import { GradProject } from './entites/grad-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Program, GradProject])],
  controllers: [GradProjectController],
  providers: [GradProjectService],
})
export class GradProjectModule {}
