import { Module } from '@nestjs/common';
import { RequirementController } from './requirement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequirementCourse } from './entities/requirement-course.entity';
import { Regulation } from '../regulation/entities';
import { RequirementService } from './requirement.service';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { RequirementValidationService } from './requirements-validation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequirementCourse, Regulation, Program, Course]),
  ],
  controllers: [RequirementController],
  providers: [RequirementService, RequirementValidationService],
})
export class RequirementModule {}
