import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { UUID } from 'crypto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

enum CreditHourStatus {
  EXCEEDS_MAX = 'EXCEEDS_MAX',
  BELOW_MIN = 'BELOW_MIN',
  WITHIN_RANGE = 'WITHIN_RANGE',
}

@Injectable()
export class RegistrationValidationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async validate(
    studentId: UUID,
    createRegistrationDto: CreateRegistrationDto,
  ) {
    const { courseIds } = createRegistrationDto;

    if (courseIds.length === 0)
      throw new BadRequestException(`You haven't registered for any courses`);

    // Check for duplicate courses
    if (this.hasDuplicateCourses(courseIds)) {
      throw new BadRequestException('Duplicate courses are not allowed.');
    }

    // Ensure all selected courses exist
    if (!(await this.doAllCoursesExist(courseIds))) {
      throw new BadRequestException(
        'One or more selected courses do not exist.',
      );
    }

    // Check if credit hours are within the allowed range
    const { creditHourStatus, minHours, maxHours, totalCreditHours } =
      await this.isCreditHoursWithinRange(studentId, courseIds);

    if (creditHourStatus === CreditHourStatus.EXCEEDS_MAX) {
      throw new BadRequestException(
        `Total credit hours (${totalCreditHours}) exceeds the maximum allowed (${maxHours}).`,
      );
    }

    if (creditHourStatus === CreditHourStatus.BELOW_MIN) {
      throw new BadRequestException(
        `Total credit hours (${totalCreditHours}) is less than the minimum required (${minHours}).`,
      );
    }

    // Check if prerequisites are met
    if (!(await this.hasAllPrerequisitesMet(studentId, courseIds))) {
      throw new BadRequestException(
        'One or more selected courses do not meet prerequisite requirements.',
      );
    }

    // Validate if the student is within the allowed retake limits
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
    const completedCourseIds =
      await this.academicInfoService.getTakenCourseIds(studentId);

    const courseQuery = this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...selectedCourseIds)', { selectedCourseIds })
      .andWhere('course.prerequisiteId IS NOT NULL');

    if (completedCourseIds.length > 0) {
      courseQuery.andWhere(
        'course.prerequisiteId NOT IN (:...completedCourseIds)',
        { completedCourseIds },
      );
    }

    return !(await courseQuery.getExists());
  }

  async validateCourseRegistrationLimits(studentId: UUID, courseIds: UUID[]) {
    // Get the number of courses the student has previously retaken
    const previousRetakeAttempts = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .where('student.userId = :studentId', { studentId })
      .groupBy('semesterCourse.courseId')
      .having('COUNT(*) > 1')
      .getCount();

    // Get the maximum number of allowed retake attempts from academic regulations
    const maxAllowedRetakes =
      await this.academicInfoService.getMaxRetakeCourses(studentId);

    // Calculate the remaining retakes the student is allowed
    const availableRetakeSlots = maxAllowedRetakes - previousRetakeAttempts;

    // Get the number of courses the student is attempting to retake this semester
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
