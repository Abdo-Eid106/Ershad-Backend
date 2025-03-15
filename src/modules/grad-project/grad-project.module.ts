import { Module } from '@nestjs/common';
import { GradProjectService } from './grad-project.service';
import { GradProjectController } from './grad-project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entites/course.entity';
import { Program } from '../program/entities/program.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Program])],
  controllers: [GradProjectController],
  providers: [GradProjectService],
})
export class GradProjectModule {}
