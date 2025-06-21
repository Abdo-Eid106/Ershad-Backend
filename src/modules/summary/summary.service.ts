import { Repository } from 'typeorm';
import { Regulation } from '../regulation/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { Officer } from '../officer/entities/officer.entity';
import { SemesterCourse } from '../semester/entities/semester-course.entity';

export class SummaryService {
  constructor(
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Officer)
    private readonly officerRepo: Repository<Officer>,
    @InjectRepository(SemesterCourse)
    private readonly semesterCourseRepo: Repository<SemesterCourse>,
  ) {}

  async getAdminDashboardSummary() {
    const totalRegulations = await this.getTotalRegulations();
    const totalPrograms = await this.getTotalPrograms();
    const totalCourses = await this.getTotalCourses();
    const totalOfficers = await this.getTotalOfficers();
    const mostEnrolledProgram = await this.getMostEnrolledProgram();
    const leastEnrolledProgram = await this.getLeastEnrolledProgram();
    const newlyAddedCourses = await this.getNewlyAddedCourses();
    const mostEnrolledCourses = await this.getMostEnrolledCourses();

    return {
      totalRegulations,
      totalPrograms,
      totalCourses,
      totalOfficers,
      mostEnrolledProgram,
      leastEnrolledProgram,
      newlyAddedCourses,
      mostEnrolledCourses,
    };
  }

  async getTotalRegulations() {
    return this.regulationRepo.count();
  }

  async getTotalPrograms() {
    return this.programRepo.count();
  }

  async getTotalCourses() {
    return this.courseRepo.count();
  }

  async getTotalOfficers() {
    return this.officerRepo.count();
  }

  async getMostEnrolledProgram() {
    return this.programRepo
      .createQueryBuilder('program')
      .leftJoin('program.academicInfos', 'ac')
      .groupBy('program.id')
      .select('program.id', 'id')
      .addSelect('program.name', 'name')
      .addSelect('program.degree', 'degree')
      .addSelect('COUNT(ac.studentId)', 'enrollments')
      .orderBy('enrollments', 'DESC')
      .getRawOne();
  }

  async getLeastEnrolledProgram() {
    return this.programRepo
      .createQueryBuilder('program')
      .leftJoin('program.academicInfos', 'ac')
      .groupBy('program.id')
      .select('program.id', 'id')
      .addSelect('program.name', 'name')
      .addSelect('program.degree', 'degree')
      .addSelect('COUNT(ac.studentId)', 'enrollments')
      .orderBy('enrollments', 'ASC')
      .getRawOne();
  }

  async getNewlyAddedCourses() {
    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.prerequisite', 'prerequisite')
      .orderBy('course.createdAt', 'DESC')
      .limit(5)
      .getMany();
  }

  async getMostEnrolledCourses() {
    return this.semesterCourseRepo
      .createQueryBuilder('semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .groupBy('course.id')
      .select('course.id', 'id')
      .addSelect('course.name', 'name')
      .addSelect('course.code', 'code')
      .addSelect('COUNT(semesterCourse.id)', 'enrollments')
      .orderBy('enrollments', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
