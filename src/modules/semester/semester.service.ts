import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSemesterDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { CourseService } from '../course/course.service';
import { SemesterCourse } from './entities/semester-course.entity';
import { Student } from '../student/entities/student.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { User } from '../user/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { Queue } from 'bullmq';
import { Course } from '../course/entites/course.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { RequirementCategory } from '../requirement/enums/requirement-category.enum';
import { CourseGpaRange } from '../regulation/entities';
import { RequirementCourse } from '../requirement/entities/requirement-course.entity';
import {
  SemesterCourseDto,
  SemesterCoursePerformance,
  SemesterDto,
  SemesterStatistics,
} from './dto/output/semester.dto';

export interface CourseRecord {
  courseId: Course['id'];
  courseName: Course['name'];
  code: Course['code'];
  creditHours: Course['creditHours'];
  degree: SemesterCourse['degree'];
  gpa: CourseGpaRange['gpa'];
  grade: CourseGpaRange['name'];
  semesterId: Semester['id'];
  startYear: Semester['startYear'];
  endYear: Semester['endYear'];
  semester: Semester['semester'];
  category: RequirementCourse['category'];
}

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private readonly semesterRepo: Repository<Semester>,
    @InjectRepository(SemesterCourse)
    private readonly semesterCourseRepo: Repository<SemesterCourse>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly courseService: CourseService,
    @InjectQueue(QueuesEnum.WARNINGS)
    private readonly warningsQueue: Queue,
  ) {}

  async create(studentId: User['id'], createSemesterDto: CreateSemesterDto) {
    const { startYear, endYear, semester, semesterCourses } = createSemesterDto;

    if (startYear != endYear - 1)
      throw new BadRequestException(ErrorEnum.SEMESTER_INVALID_YEAR_RANGE);

    const studentEXist = await this.studentRepo.existsBy({ userId: studentId });
    if (!studentEXist) {
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    }

    const semesterExist = await this.semesterRepo.existsBy({
      startYear,
      semester,
      academicInfo: { studentId },
    });
    if (semesterExist) {
      throw new ConflictException(ErrorEnum.SEMESTER_ALREADY_EXISTS);
    }

    const courseIds = [
      ...new Set(
        semesterCourses.map((semesterCourse) => semesterCourse.courseId),
      ),
    ];
    if (courseIds.length != semesterCourses.length)
      throw new ConflictException(ErrorEnum.COURSE_REPEATED);
    await this.courseService.findByIds(courseIds);

    if (!courseIds.length)
      throw new BadRequestException(ErrorEnum.SEMESTER_NO_COURSES);

    const semesterRecord = await this.semesterRepo.save(
      this.semesterRepo.create({
        ...createSemesterDto,
        academicInfo: { studentId },
      }),
    );

    await this.semesterCourseRepo.save(
      semesterCourses.map((semesterCourse) =>
        this.semesterCourseRepo.create({
          semester: { id: semesterRecord.id },
          course: { id: semesterCourse.courseId },
          ...semesterCourse,
        }),
      ),
    );

    await this.warningsQueue.add('warning', {
      semesterId: semesterRecord.id,
      studentId,
    });
  }

  async findOne(id: Semester['id']) {
    const semester = await this.semesterRepo.findOne({
      where: { id },
      relations: ['academicInfo'],
    });
    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);

    const cumulativeSemesterCourses = await this.getCourseRecords(
      semester.academicInfo.studentId,
      { upToSemester: semester },
    );

    const currentSemesterCourses = cumulativeSemesterCourses.filter(
      (course) =>
        course.startYear === semester.startYear &&
        course.semester === semester.semester,
    );

    return this.buildSemesterResponse(
      semester,
      currentSemesterCourses,
      cumulativeSemesterCourses,
    );
  }

  async findStudentSemesters(studentId: Student['userId']) {
    if (!(await this.studentRepo.existsBy({ userId: studentId }))) {
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    }

    const allSemesterCourses = await this.getCourseRecords(studentId);
    return this.buildAllSemestersResponse(allSemesterCourses);
  }

  async isFirstSemester(id: Semester['id'], studentId: User['id']) {
    const semester = await this.semesterRepo.findOne({
      where: { academicInfo: { studentId } },
      order: { startYear: 'ASC', semester: 'ASC' },
    });

    if (!semester) return false;
    return semester.id == id;
  }

  private buildSemesterResponse(
    semester: Partial<Semester>,
    currentSemesterCourses: CourseRecord[],
    cumulativeSemesterCourses: CourseRecord[],
  ): SemesterDto {
    return {
      id: semester.id,
      startYear: semester.startYear,
      endYear: semester.endYear,
      semester: semester.semester,
      statistics: this.calculateStatistics(
        currentSemesterCourses,
        cumulativeSemesterCourses,
      ),
      semesterCourses: this.mapSemesterCourses(currentSemesterCourses),
    };
  }

  private buildAllSemestersResponse(
    semsterCourseRecords: CourseRecord[],
  ): SemesterDto[] {
    const semesterGroups =
      this.groupSemesterCoursesBySemester(semsterCourseRecords);

    const result = [];
    const cumulativeSemesterCourses: CourseRecord[] = [];

    for (const [semesterId, currentSemesterCourses] of semesterGroups) {
      cumulativeSemesterCourses.push(...currentSemesterCourses);

      const semesterData = {
        id: semesterId,
        startYear: currentSemesterCourses[0].startYear,
        endYear: currentSemesterCourses[0].endYear,
        semester: currentSemesterCourses[0].semester,
      };

      result.push(
        this.buildSemesterResponse(
          semesterData,
          currentSemesterCourses,
          cumulativeSemesterCourses,
        ),
      );
    }

    return result.reverse();
  }

  private groupSemesterCoursesBySemester(courses: CourseRecord[]) {
    return courses.reduce((map, course) => {
      const semesterCourses = map.get(course.semesterId) || [];
      return map.set(course.semesterId, [...semesterCourses, course]);
    }, new Map<Semester['id'], CourseRecord[]>());
  }

  private async getCourseRecords(
    studentId: string,
    options?: { upToSemester?: Semester },
  ): Promise<CourseRecord[]> {
    const query = this.buildBaseCourseQuery(studentId);

    if (options?.upToSemester) {
      this.applySemesterFilter(query, options.upToSemester);
    }

    return query.getRawMany<CourseRecord>();
  }

  private buildBaseCourseQuery(studentId: string) {
    return this.semesterRepo
      .createQueryBuilder('semester')
      .innerJoinAndSelect('semester.semesterCourses', 'semesterCourse')
      .innerJoinAndSelect('semesterCourse.course', 'course')
      .innerJoinAndSelect('semester.academicInfo', 'academicInfo')
      .innerJoinAndSelect('academicInfo.regulation', 'regulation')
      .innerJoin(
        'regulation.courseGpaRanges',
        'range',
        'semesterCourse.degree BETWEEN range.from AND range.to',
      )
      .leftJoin(
        'regulation.requirementCourses',
        'requirementCourse',
        'requirementCourse.course = course.id',
      )
      .where('academicInfo.studentId = :studentId', { studentId })
      .select(this.getCourseSelectFields())
      .orderBy('semester.startYear', 'ASC')
      .addOrderBy('semester.semester', 'ASC');
  }

  private getCourseSelectFields() {
    return [
      'course.id AS courseId',
      'course.name AS courseName',
      'course.code AS code',
      'course.creditHours AS creditHours',
      'semesterCourse.degree AS degree',
      'range.gpa AS gpa',
      'range.name AS grade',
      'semester.id AS semesterId',
      'semester.startYear AS startYear',
      'semester.endYear AS endYear',
      'semester.semester AS semester',
      'requirementCourse.category AS category',
    ];
  }

  private applySemesterFilter(
    query: SelectQueryBuilder<any>,
    semester: Semester,
  ) {
    query
      .andWhere(
        new Brackets((qb) => {
          qb.where('semester.startYear < :startYear').orWhere(
            'semester.startYear = :startYear AND semester.semester <= :semesterValue',
          );
        }),
      )
      .setParameters({
        startYear: semester.startYear,
        semesterValue: semester.semester,
      });
  }

  private calculateStatistics(
    semesterCourses: CourseRecord[],
    cumulativeCourses: CourseRecord[],
  ): SemesterStatistics {
    return {
      attemptedHours: this.getAttemptedHours(semesterCourses),
      gainedHours: this.getGainedHours(semesterCourses),
      gpa: this.computeGpa(semesterCourses),
      cumGpa: this.computeGpa(cumulativeCourses),
    };
  }

  private mapSemesterCourses(
    semesterCourses: CourseRecord[],
  ): SemesterCourseDto[] {
    return semesterCourses.map((semesterCourse) => ({
      course: {
        id: semesterCourse.courseId,
        name: semesterCourse.courseName,
        code: semesterCourse.code,
        creditHours: semesterCourse.creditHours,
      },
      performance: {
        degree: semesterCourse.degree,
        grade: semesterCourse.grade,
        gpa: semesterCourse.gpa,
      } as SemesterCoursePerformance,
    }));
  }

  computeGpa(courseRecords: CourseRecord[]) {
    courseRecords = courseRecords.filter(
      (courseRecords) =>
        courseRecords.category != RequirementCategory.UNIVERSITY,
    );
    const bestGradesMap = new Map<CourseRecord['courseId'], CourseRecord>();

    for (const record of courseRecords) {
      const existing = bestGradesMap.get(record.courseId);
      if (!existing || record.gpa > existing.gpa) {
        bestGradesMap.set(record.courseId, record);
      }
    }

    const distinctCourses = [...bestGradesMap.values()];
    const totalWeightedPoints = distinctCourses.reduce(
      (sum, course) => sum + course.gpa * course.creditHours,
      0,
    );
    const totalCreditHours = distinctCourses.reduce(
      (sum, course) => sum + course.creditHours,
      0,
    );

    return totalCreditHours === 0
      ? 0
      : parseFloat((totalWeightedPoints / totalCreditHours).toFixed(2));
  }

  getAttemptedHours(courseRecords: CourseRecord[]) {
    return courseRecords.reduce(
      (sum, courseRecord) => sum + courseRecord.creditHours,
      0,
    );
  }

  getGainedHours(courseRecords: CourseRecord[]) {
    return courseRecords.reduce(
      (sum, courseRecord) =>
        sum + (courseRecord.gpa ? courseRecord.creditHours : 0),
      0,
    );
  }

  async remove(id: Semester['id']) {
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    return this.semesterRepo.remove(semester);
  }

  async getStudentGpa(studentId: Student['userId']) {
    const semester = await this.semesterRepo.findOne({
      where: { academicInfo: { studentId } },
      order: {
        startYear: 'DESC',
        semester: 'DESC',
      },
    });
    if (!semester) return 0;

    const result = await this.findOne(semester.id);
    return result.statistics.cumGpa;
  }
}
