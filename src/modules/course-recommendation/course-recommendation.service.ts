import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { UUID } from 'crypto';
import { Repository } from 'typeorm';
import { Plan } from '../plan/entities/plan.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { InjectRepository } from '@nestjs/typeorm';
import { COURSE_SELECT_FIELDS } from '../course/constants';
import { PlanService } from '../plan/plan.service';

@Injectable()
export class CourseRecommendationService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    private readonly planService: PlanService,
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async getRecommenedCourses(studentId: UUID) {
    const plan =
      (await this.planService.getProgramPlan(studentId)) ||
      (await this.planService.getAlternativeProgramPlan(studentId));

    if (!plan) {
      throw new ServiceUnavailableException(
        'recommendation service is currently unavailable',
      );
    }

    const courseIds =
      await this.academicInfoService.getTakenCourseIds(studentId);

    return this.planRepo
      .createQueryBuilder('plan')
      .leftJoin('plan.semesterPlans', 'semesterPlan')
      .leftJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
      .leftJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('plan.programId = :programId', { programId: plan.programId })
      .andWhere('course.id NOT IN (:...courseIds)', {
        courseIds: courseIds.length ? courseIds : [null],
      })
      .andWhere(
        '(prerequisite.id IS NULL OR prerequisite.id IN (:...courseIds))',
        {
          courseIds: courseIds.length ? courseIds : [null],
        },
      )
      .select([...COURSE_SELECT_FIELDS])
      .orderBy('semesterPlan.level', 'ASC')
      .addOrderBy('semesterPlan.semester', 'ASC')
      .getRawMany();
  }
}
