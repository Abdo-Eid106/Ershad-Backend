import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { PlanCourse } from './entities/plan-course.entity';
import { Program } from '../program/entities/program.entitiy';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, PlanCourse, Program]),
    CourseModule,
  ],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}
