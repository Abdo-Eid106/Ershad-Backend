import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationService } from './registration.service';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { User } from '../user/entities/user.entity';

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
    studentId: User['id'],
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
      !(await this.academicInfoService.canStudentRetakeCoursesWithoutLimit(
        studentId,
      ))
    ) {
      const {
        isValid,
        previousRetakeAttempts,
        maxAllowedRetakes,
        availableRetakes,
        selectedRetakeCount,
      } = await this.validateCourseRetakeLimits(studentId, courseIds);

      if (!isValid) {
        throw new BadRequestException({
          message: ErrorEnum.RETAKE_LIMIT_EXCEEDED,
          args: {
            previous: previousRetakeAttempts,
            max: maxAllowedRetakes,
            selected: selectedRetakeCount,
            available: availableRetakes,
          },
        });
      }
    }

    return true;
  }

  hasDuplicateCourses(courseIds: Course['id'][]) {
    return new Set(courseIds).size !== courseIds.length;
  }

  async doAllCoursesExist(courseIds: Course['id'][]) {
    const count = await this.courseRepo.count({ where: { id: In(courseIds) } });
    return count === courseIds.length;
  }

  async isCreditHoursWithinRange(
    studentId: User['id'],
    courseIds: Course['id'][],
  ) {
    const { totalCreditHours } = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .select(['SUM(course.creditHours) as totalCreditHours'])
      .getRawOne<{ totalCreditHours: number }>();

    const [minHours, maxHours] =
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
    studentId: User['id'],
    selectedCourseIds: Course['id'][],
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

  async validateCourseRetakeLimits(
    studentId: User['id'],
    courseIds: Course['id'][],
  ) {
    const [previousRetakeAttempts, maxAllowedRetakes] = await Promise.all([
      this.academicInfoService.getPreviousRetakeAttempts(studentId),
      this.academicInfoService.getMaxAllowedRetakes(studentId),
    ]);

    const availableRetakes = maxAllowedRetakes - previousRetakeAttempts;

    const selectedRetakeCount = await this.courseRepo
      .createQueryBuilder('course')
      .innerJoin('course.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.semester', 'semester')
      .innerJoin('semester.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.student', 'student')
      .where('student.userId = :studentId', { studentId })
      .andWhere('course.id IN (:...courseIds)', { courseIds })
      .select('DISTINCT(course.id) AS selectedRetakeCount')
      .getCount();

    const isValid = selectedRetakeCount <= availableRetakes;

    return {
      isValid,
      previousRetakeAttempts,
      maxAllowedRetakes,
      availableRetakes,
      selectedRetakeCount,
    };
  }
}
