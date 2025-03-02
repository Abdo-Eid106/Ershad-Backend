import { Module } from '@nestjs/common';
import { CourseRecommendationController } from './course-recommendation.controller';
import { CourseRecommendationService } from './course-recommendation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '../plan/entities/plan.entity';
import { Course } from '../course/entites/course.entity';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { AcademicInfoModule } from '../academic-info/academic-info.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Course, AcademicInfo]),
    AcademicInfoModule,
  ],
  controllers: [CourseRecommendationController],
  providers: [CourseRecommendationService],
})
export class CourseRecommendationModule {}
