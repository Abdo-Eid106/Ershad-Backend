import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Program } from '../program/entities/program.entitiy';
import { CourseModule } from '../course/course.module';
import { Course } from '../course/entites/course.entity';
import { PlanValidationService } from './plan-validation.service';
import { SemesterPlan } from './entities/semester-plan.entity';
import { SemesterPlanCourse } from './entities/semester-plan-course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Plan,
      Program,
      Course,
      SemesterPlan,
      SemesterPlanCourse,
    ]),
    CourseModule,
  ],
  controllers: [PlanController],
  providers: [PlanService, PlanValidationService],
})
export class PlanModule {}
