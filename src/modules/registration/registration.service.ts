import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    private readonly academicInfoService: AcademicInfoService,
    private readonly dataSource: DataSource,
  ) {}

  async getPrediction(studentId: UUID) {
    //get taken courses
    const courseIds =
      await this.academicInfoService.getTakenCourseIds(studentId);
    const { min, max } =
      await this.academicInfoService.getRegistrationHoursRange(studentId);

    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .innerJoin('course.requirementCourses', 'requirementCourse')
      .innerJoin('requirementCourse.regulation', 'regulation')
      .innerJoin('regulation.academicInfos', 'academicInfo')
      .innerJoin('academicInfo.student', 'student')
      .where('student.userId = :studentId', { studentId })
      .andWhere(
        'prerequisite.id is NULL OR prerequisite.id IN (:...courseIds)',
        { courseIds },
      )
      .select([
        'course.id AS id',
        'course.name AS name',
        'course.code AS code',
        'course.lectureHours AS lectureHours',
        'course.practicalHours AS practicalHours',
        'course.creditHours AS creditHours',
        'course.level AS level',
        'course.prerequisite AS prerequisite',
        'requirementCourse.optional AS optional',
      ])
      .orderBy('requirementCourse.optional', 'DESC')
      .getRawMany();
  }

  async create(studentId: UUID, createRegistrationDto: CreateRegistrationDto) {
    const { courseIds } = createRegistrationDto;
    if (courseIds.length === 0)
      throw new BadRequestException(`You haven't registered for any courses`);

    // Check for duplicate courses
    const uniqueCourseIds = [...new Set(courseIds)];
    if (courseIds.length !== uniqueCourseIds.length)
      throw new BadRequestException('Duplicate courses detected');

    // Get the total count of valid courses and their total credit hours
    const { courseCount, totalCreditHours } = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .select([
        'COUNT(*) AS courseCount',
        'SUM(course.creditHours) as totalCreditHours',
      ])
      .getRawOne();

    // Ensure all provided courses exist
    if (courseCount < courseIds.length)
      throw new NotFoundException('Some courses were not found');

    // Validate if the total credit hours fall within the allowed range
    const { min: minHours, max: maxHours } =
      await this.academicInfoService.getRegistrationHoursRange(studentId);

    if (totalCreditHours < minHours || totalCreditHours > maxHours) {
      throw new BadRequestException(
        `Total registered credit hours must be between ${minHours} and ${maxHours}.`,
      );
    }

    // Get the list of courses the student has already passed
    const completedCourseIds =
      await this.academicInfoService.getTakenCourseIds(studentId);

    // Check if any selected course violates prerequisite requirements
    const queryBuilder = this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('course.prerequisiteId IS NOT NULL');

    if (completedCourseIds.length > 0) {
      queryBuilder.andWhere(
        'course.prerequisiteId NOT IN (:...completedCourseIds)',
        { completedCourseIds },
      );
    }

    const invalidCourse = await queryBuilder.getOne();
    if (invalidCourse) {
      throw new BadRequestException(
        `Course with ID: ${invalidCourse.id} cannot be registered as prerequisites are not met.`,
      );
    }

    // Get the number of courses the student has previously retaken
    const previousRetakeCount = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .where('student.userId = :studentId', { studentId })
      .groupBy('semesterCourse.courseId')
      .having('COUNT(*) > 1')
      .getCount();

    // Get the maximum allowed retake courses from the regulations
    const maxAllowedRetakes =
      await this.academicInfoService.getMaxRetakeCourses(studentId);

    // Calculate the remaining retakes the student is allowed
    const remainingRetakes = maxAllowedRetakes - previousRetakeCount;

    // Get the number of courses the student is attempting to retake this semester
    const currentRetakeCount = await this.courseRepo
      .createQueryBuilder('course')
      .innerJoin('course.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.semester', 'semester')
      .innerJoin('semester.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.student', 'student')
      .where('student.userId = :studentId', { studentId })
      .andWhere('course.id IN (:...courseIds)', { courseIds })
      .getCount();

    // Validate if the student exceeds the allowed retake limit
    if (currentRetakeCount > remainingRetakes) {
      throw new BadRequestException(
        `You can only retake up to ${remainingRetakes} more courses.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if a registration already exists and delete it
      await queryRunner.manager.delete(Registration, {
        academicInfoId: studentId,
      });
      // Create a new Registration entry
      const registration = queryRunner.manager.create(Registration, {
        academicInfo: { studentId },
      });
      await queryRunner.manager.save(registration);

      // Create RegistrationCourse entries
      const registrationCourses = courseIds.map((courseId) =>
        queryRunner.manager.create(RegistrationCourse, {
          registrationId: registration.academicInfoId,
          courseId,
        }),
      );

      await queryRunner.manager.save(registrationCourses);
      await queryRunner.commitTransaction();
      return registration;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Registration failed: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
