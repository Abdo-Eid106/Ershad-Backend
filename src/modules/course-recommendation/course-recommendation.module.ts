import { Module } from '@nestjs/common';
import { CourseRecommendationController } from './course-recommendation.controller';
import { CourseRecommendationService } from './course-recommendation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../plan/entities/plan.entity';
import { Course } from '../course/entites/course.entity';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { RegistrationModule } from '../registration/registration.module';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { PlanModule } from '../plan/plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Course, AcademicInfo]),
    PlanModule,
    RegistrationModule,
    AcademicInfoModule,
  ],
  controllers: [CourseRecommendationController],
  providers: [CourseRecommendationService],
})
export class CourseRecommendationModule {}
