import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { UUID } from 'crypto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationService } from './registration.service';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

enum CreditHourStatus {
  EXCEEDS_MAX = 'EXCEEDS_MAX',
  BELOW_MIN = 'BELOW_MIN',
  WITHIN_RANGE = 'WITHIN_RANGE',
}

@Injectable()
export class RegistrationValidationService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @Inject(forwardRef(() => RegistrationService))
    private readonly registrationService: RegistrationService,
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async validate(
    studentId: UUID,
    createRegistrationDto: CreateRegistrationDto,
  ) {
    const { courseIds } = createRegistrationDto;

    if (courseIds.length === 0)
      throw new BadRequestException(ErrorEnum.NO_COURSES_REGISTERED);

    if (this.hasDuplicateCourses(courseIds)) {
      throw new BadRequestException(ErrorEnum.DUPLICATE_COURSES_NOT_ALLOWED);
    }

    if (!(await this.doAllCoursesExist(courseIds))) {
      throw new BadRequestException(ErrorEnum.COURSES_NOT_EXIST);
    }

    const { creditHourStatus, minHours, maxHours, totalCreditHours } =
      await this.isCreditHoursWithinRange(studentId, courseIds);

    if (creditHourStatus === CreditHourStatus.EXCEEDS_MAX) {
      throw new BadRequestException({
        message: ErrorEnum.CREDIT_HOURS_EXCEED_MAX,
        args: { total: totalCreditHours, max: maxHours },
      });
    }

    if (creditHourStatus === CreditHourStatus.BELOW_MIN) {
      throw new BadRequestException({
        message: ErrorEnum.CREDIT_HOURS_BELOW_MIN,
        args: { total: totalCreditHours, min: minHours },
      });
    }

    if (!(await this.hasAllPrerequisitesMet(studentId, courseIds))) {
      throw new BadRequestException(ErrorEnum.PREREQUISITE_NOT_MET);
    }

    if (
      !(await this.academicInfoService.canStudentRetakeCourseWithoutLimit(
        studentId,
      ))
    ) {
      const {
        isValid,
        previousRetakeAttempts,
        maxAllowedRetakes,
        availableRetakeSlots,
        selectedRetakeCount,
      } = await this.validateCourseRegistrationLimits(studentId, courseIds);

      if (!isValid) {
        throw new BadRequestException({
          message: ErrorEnum.RETAKE_LIMIT_EXCEEDED,
          args: {
            previous: previousRetakeAttempts,
            max: maxAllowedRetakes,
            selected: selectedRetakeCount,
            available: availableRetakeSlots,
          },
        });
      }
    }

    return true;
  }

  hasDuplicateCourses(courseIds: UUID[]) {
    return new Set(courseIds).size !== courseIds.length;
  }

  async doAllCoursesExist(courseIds: UUID[]) {
    const count = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getCount();
    return count === courseIds.length;
  }

  async isCreditHoursWithinRange(studentId: UUID, courseIds: UUID[]) {
    const { totalCreditHours } = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .select(['SUM(course.creditHours) as totalCreditHours'])
      .getRawOne();

    const { min: minHours, max: maxHours } =
      await this.academicInfoService.getRegistrationHoursRange(studentId);

    const creditHourStatus =
      totalCreditHours > maxHours
        ? CreditHourStatus.EXCEEDS_MAX
        : totalCreditHours < minHours
          ? CreditHourStatus.BELOW_MIN
          : CreditHourStatus.WITHIN_RANGE;
    return { creditHourStatus, minHours, maxHours, totalCreditHours };
  }

  async hasAllPrerequisitesMet(
    studentId: UUID,
    selectedCourseIds: UUID[],
  ): Promise<boolean> {
    const availableCourses =
      await this.registrationService.getStudentAvailableCourses(studentId);
    const availableCourseIds = new Set(
      availableCourses.map((course) => course.id),
    );

    return selectedCourseIds.every((courseId) =>
      availableCourseIds.has(courseId),
    );
  }

  async validateCourseRegistrationLimits(studentId: UUID, courseIds: UUID[]) {
    const [previousRetakeAttempts, maxAllowedRetakes] = await Promise.all([
      this.academicInfoService.getPreviousRetakeAttempts(studentId),
      this.academicInfoService.getMaxRetakeCourses(studentId),
    ]);

    const availableRetakeSlots = maxAllowedRetakes - previousRetakeAttempts;

    const selectedRetakeCount = await this.courseRepo
      .createQueryBuilder('course')
      .innerJoin('course.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.semester', 'semester')
      .innerJoin('semester.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.student', 'student')
      .where('student.userId = :studentId', { studentId })
      .andWhere('course.id IN (:...courseIds)', { courseIds })
      .getCount();

    const isValid = selectedRetakeCount <= availableRetakeSlots;

    return {
      isValid,
      previousRetakeAttempts,
      maxAllowedRetakes,
      availableRetakeSlots,
      selectedRetakeCount,
    };
  }
}
