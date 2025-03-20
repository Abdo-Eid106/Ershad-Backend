import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { UUID } from 'crypto';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { RegistrationService } from './registration.service';

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

    // if (courseIds.length === 0)
    //   throw new BadRequestException(`You haven't registered for any courses`);

    // if (this.hasDuplicateCourses(courseIds)) {
    //   throw new BadRequestException('Duplicate courses are not allowed.');
    // }

    // if (!(await this.doAllCoursesExist(courseIds))) {
    //   throw new BadRequestException(
    //     'One or more selected courses do not exist.',
    //   );
    // }

    // const { creditHourStatus, minHours, maxHours, totalCreditHours } =
    //   await this.isCreditHoursWithinRange(studentId, courseIds);

    // if (creditHourStatus === CreditHourStatus.EXCEEDS_MAX) {
    //   throw new BadRequestException(
    //     `Total credit hours (${totalCreditHours}) exceeds the maximum allowed (${maxHours}).`,
    //   );
    // }

    // if (creditHourStatus === CreditHourStatus.BELOW_MIN) {
    //   throw new BadRequestException(
    //     `Total credit hours (${totalCreditHours}) is less than the minimum required (${minHours}).`,
    //   );
    // }

    if (!(await this.hasAllPrerequisitesMet(studentId, courseIds))) {
      throw new BadRequestException(
        'One or more selected courses do not meet prerequisite requirements.',
      );
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
        throw new BadRequestException(
          `Retake limit exceeded. You have retaken ${previousRetakeAttempts} courses (max: ${maxAllowedRetakes}). ` +
            `You are attempting to retake ${selectedRetakeCount} courses, but only ${availableRetakeSlots} slots are available.`,
        );
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
