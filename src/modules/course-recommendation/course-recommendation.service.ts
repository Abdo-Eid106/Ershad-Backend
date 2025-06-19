import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Plan } from '../plan/entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { COURSE_SELECT_FIELDS } from '../course/constants';
import { PlanService } from '../plan/plan.service';
import { RegistrationService } from '../registration/registration.service';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class CourseRecommendationService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    private readonly planService: PlanService,
    private readonly registrationService: RegistrationService,
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async getRecommenedCourses(studentId: Student['userId']) {
    const plan =
      (await this.planService.getProgramPlan(studentId)) ||
      (await this.planService.getAlternativeProgramPlan(studentId));

    if (!plan) {
      throw new ServiceUnavailableException(
        ErrorEnum.RECOMMENDATION_SERVICE_UNAVAILABLE,
      );
    }

    const availableCourses =
      await this.registrationService.getStudentAvailableCourses(studentId);
    const availableCourseIds = availableCourses.map((course) => course.id);
    const passedCourseIds = new Set(
      await this.academicInfoService.getPassedCourseIds(studentId),
    );
    const targetCourseIds = availableCourseIds.filter(
      (id) => !passedCourseIds.has(id),
    );

    return this.planRepo
      .createQueryBuilder('plan')
      .leftJoin('plan.semesterPlans', 'semesterPlan')
      .leftJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
      .leftJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('plan.programId = :programId', { programId: plan.programId })
      .andWhere('course.id IN (:...courseIds)', {
        courseIds: targetCourseIds.length ? targetCourseIds : [null],
      })
      .select([...COURSE_SELECT_FIELDS])
      .orderBy('semesterPlan.level', 'ASC')
      .addOrderBy('semesterPlan.semester', 'ASC')
      .getRawMany();
  }
}
