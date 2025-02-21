import { Injectable, NotFoundException } from '@nestjs/common';
import { UUID } from 'crypto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { EntityManager, Repository } from 'typeorm';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { Regulation } from '../regulation/entities';
import { AcademicInfo } from './entities/academic-info.entity';

@Injectable()
export class AcademicInfoService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getAcademicInfo(studentId: UUID) {
    const student = await this.studentRepo.findOne({
      where: { userId: studentId },
      relations: ['academicInfo', 'academicInfo.regulation'],
    });
    if (!student) throw new NotFoundException('student not found');

    const attemptedHours = await this.getAttemptedHours(studentId);
    const gainedHours = await this.getGainedHours(studentId);
    const gpa = await this.getGpa(studentId);
    const level = await this.getLevel(studentId);

    return {
      attemptedHours,
      gainedHours,
      gpa,
      level,
      regulation: student.academicInfo.regulation,
    };
  }

  async update(studentId: UUID, updateAcademicInfoDto: UpdateAcademicInfoDto) {
    const academicInfo = await this.academicInfoRepo.findOne({
      where: { studentId },
    });
    if (!academicInfo) throw new NotFoundException('student not found');

    const regulation = await this.regulationRepo.findOne({
      where: { id: updateAcademicInfoDto.regulationId },
    });
    if (!regulation) throw new NotFoundException('regulation not found');

    return this.academicInfoRepo.save({ ...academicInfo, regulation });
  }

  async getGpa(studentId: UUID) {
    const subQuery = this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .leftJoin('ac.semesters', 'semester')
      .leftJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .select('course.id', 'courseId')
      .addSelect('semesterCourse.degree', 'degree')
      .addSelect(
        'RANK() OVER(PARTITION BY course.id ORDER BY semester.startYear ASC, semester.semester ASC)',
        'rank',
      )
      .addSelect('course.creditHours', 'creditHours')
      .where('student.userId = :studentId', { studentId });

    const maxRetakeGrade = await this.getMaxRetakeGrade(studentId);

    const subQuery2 = this.entityManager
      .createQueryBuilder()
      .select([
        'sub.courseId AS id',
        `MAX(
          CASE 
            WHEN sub.rank = 1 THEN sub.degree 
            ELSE LEAST(sub.degree, :maxRetakeGrade) 
          END
        ) AS degree`,
        'sub.creditHours AS creditHours',
      ])
      .from(`(${subQuery.getQuery()})`, 'sub')
      .setParameters({ ...subQuery.getParameters(), maxRetakeGrade })
      .groupBy('sub.courseId');

    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.courseGpaRanges', 'range')
      .innerJoin(
        `(${subQuery2.getQuery()})`,
        'sub',
        'sub.degree BETWEEN range.from AND range.to',
      )
      .select(
        `CASE 
          WHEN SUM(sub.creditHours) > 0 THEN ROUND(SUM(range.gpa * sub.creditHours) / SUM(sub.creditHours), 2)
          ELSE 0 
        END AS gpa`,
      )
      .where('student.userId = :studentId', { studentId })
      .setParameters({ studentId, ...subQuery2.getParameters() })
      .getRawOne();
    return result.gpa;
  }

  async getLevel(studentId: UUID) {
    const gainedHours = await this.getGainedHours(studentId);
    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'academicInfo')
      .innerJoin('academicInfo.regulation', 'regulation')
      .innerJoin('regulation.levels', 'level')
      .groupBy('regulation.id')
      .where('level.reqHours <= :gainedHours', { gainedHours })
      .select('MAX(level.value)', 'level')
      .getRawOne();
    return result?.level ?? 1;
  }

  async getAttemptedHours(studentId: UUID) {
    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .leftJoin('ac.semesters', 'semester')
      .leftJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .where('student.userId = :studentId', { studentId })
      .groupBy('student.userId')
      .select('COALESCE(SUM(course.creditHours), 0)', 'triedHours')
      .getRawOne();

    return parseInt(result?.triedHours ?? '0');
  }

  async getGainedHours(studentId: UUID) {
    const successDegree = await this.getSuccessDegree(studentId);

    const result = await this.entityManager
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN sub.maxDegree >= :successDegree THEN sub.creditHours ELSE 0 END)`,
        'totalGainedHours',
      )
      .from((qb) => {
        return qb
          .select('MAX(semesterCourse.degree)', 'maxDegree')
          .addSelect('course.id', 'courseId')
          .addSelect('course.creditHours', 'creditHours')
          .from('student', 'student')
          .innerJoin('student.academicInfo', 'ac')
          .leftJoin('ac.semesters', 'semester')
          .leftJoin('semester.semesterCourses', 'semesterCourse')
          .innerJoin('semesterCourse.course', 'course')
          .where('student.userId = :studentId', { studentId })
          .groupBy('course.id, course.creditHours');
      }, 'sub')
      .setParameter('successDegree', successDegree)
      .getRawOne();

    return parseInt(result?.totalGainedHours ?? '0');
  }

  async getSuccessDegree(studentId: UUID) {
    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('regulation.courseGpaRanges', 'ranges')
      .groupBy('regulation.id')
      .select('MIN(ranges.to)', 'to')
      .where('student.userId = :studentId', { studentId })
      .getRawOne();
    return result?.to ? result.to + 1 : 50;
  }

  async getMaxRetakeGrade(studentId: UUID) {
    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('regulation.retakeRules', 'retakeRules')
      .where('student.userId = :studentId', { studentId })
      .select('retakeRules.maxRetakeGrade', 'maxRetakeGrade')
      .getRawOne();
    return result?.maxRetakeGrade ?? 0;
  }

  async getTakenCourseIds(studentId: UUID) {
    const successDegree = await this.getSuccessDegree(studentId);

    const result = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .where('semesterCourse.degree >= :successDegree', { successDegree })
      .andWhere('student.userId = :studentId', { studentId })
      .select('DISTINCT semesterCourse.courseId', 'id')
      .getRawMany();

    return result.map((result) => result.id) as UUID[];
  }

  async isUnderGpaRules(studentId: UUID) {
    const semesters = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.semesters', 'semesters')
      .where('student.userId = :studentId', { studentId })
      .getCount();

    const { semestersWithoutGpaRules } = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'ar')
      .where('student.userId = :studentId', { studentId })
      .select('ar.semestersWithoutGpaRules', 'semestersWithoutGpaRules')
      .getRawOne();

    return semesters >= semestersWithoutGpaRules;
  }

  async getRegisterationHoursRange(
    studentId: UUID,
  ): Promise<{ min: number; max: number }> {
    const gpa = await this.getGpa(studentId);
    const isUnderGpaRules = await this.isUnderGpaRules(studentId);

    return this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('regulation.registrationRules', 'rs')
      .where('student.userId = :studentId', { studentId })
      .select([
        `CASE
          WHEN NOT :isUnderGpaRules THEN rs.normalRegistrationHours
          ELSE rs.minRegistrationHours
        END AS min`,
        `CASE
          WHEN NOT :isUnderGpaRules THEN rs.normalRegistrationHours
          WHEN :gpa >= rs.gpaForMaxHours THEN rs.maxRegistrationHours
          ELSE rs.normalRegistrationHours
        END AS max`,
      ])
      .setParameters({ gpa, isUnderGpaRules })
      .getRawOne();
  }
}
