import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class RegisterationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async getPrediction(studentId: UUID) {
    //get taken courses
    const courseIds =
      await this.academicInfoService.getTakenCourseIds(studentId);
    const { min, max } =
      await this.academicInfoService.getRegisterationHoursRange(studentId);

    return (
      this.courseRepo
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
        .getRawMany()
    );
  }
}
