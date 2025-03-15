import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { UUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
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
    private readonly entityManager: EntityManager,
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
      .innerJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('course.id NOT IN (:...courseIds)', {
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

  // async getRecommenedCourses(studentId: UUID) {
  //   const plan =
  //     (await this.planService.getProgramPlan(studentId)) ||
  //     (await this.planService.getAlternativeProgramPlan(studentId));
  //   if (!plan) {
  //     throw new ServiceUnavailableException(
  //       'recommendation service is currently unavailable',
  //     );
  //   }

  //   const courseIds =
  //     await this.academicInfoService.getTakenCourseIds(studentId);

  //   const coursesSubQuery = this.planRepo
  //     .createQueryBuilder('plan')
  //     .leftJoin('plan.semesterPlans', 'semesterPlan')
  //     .leftJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
  //     .innerJoin('semesterPlanCourse.course', 'course')
  //     .leftJoin('course.prerequisite', 'prerequisite')
  //     .where('course.id NOT IN (:...courseIds)', {
  //       courseIds: courseIds.length ? courseIds : [null],
  //     })
  //     .andWhere(
  //       '(prerequisite.id IS NULL OR prerequisite.id IN (:...courseIds))',
  //       {
  //         courseIds: courseIds.length ? courseIds : [null],
  //       },
  //     )
  //     .select([
  //       ...COURSE_SELECT_FIELDS,
  //       'semesterPlan.level AS level',
  //       'semesterPlan.semester AS semester',
  //       `SUM(course.creditHours) OVER (
  //         ORDER BY semesterPlan.level ASC,  semesterPlan.semester ASC
  //       ) AS sum`,
  //       '(semesterPlan.level - 1) * 2 + semesterPlan.semester AS semesterOrder',
  //     ])
  //     .orderBy('semesterPlan.level', 'ASC')
  //     .addOrderBy('semesterPlan.semester', 'ASC');

  //   const { max: maxCredits } =
  //     await this.academicInfoService.getRegistrationHoursRange(studentId);
  //   const currentSemester =
  //     await this.academicInfoService.getCurrentSemester(studentId);

  //   return this.entityManager
  //     .createQueryBuilder()
  //     .select('*')
  //     .from(`(${coursesSubQuery.getQuery()})`, 'sub')
  //     .where('sub.sum <= :maxCredits', { maxCredits })
  //     .andWhere('sub.semesterOrder <= :currentSemester', { currentSemester })
  //     .setParameters(coursesSubQuery.getParameters())
  //     .getRawMany();
  // }
}
