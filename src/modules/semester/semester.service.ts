import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSemesterDto, SemesterDto, SemestersDto } from './dto';
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
import { Repository } from 'typeorm';

interface ISemestarData {
  id: Semester['id'];
  startYear: number;
  endYear: number;
  semester: number;
  studentId: User['id'];
  name: { en: string; ar: string };
  nationalId: string;
  universityId: string;
  courseId: Course['id'];
  degree: number;
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

    //check if the end year is equal to the start year + 1
    if (startYear != endYear - 1)
      throw new BadRequestException(ErrorEnum.SEMESTER_INVALID_YEAR_RANGE);

    //check if the student is exist
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    //check if this semester already exist
    if (
      await this.semesterRepo.existsBy({
        startYear,
        semester,
        academicInfo: { studentId },
      })
    )
      throw new ConflictException(ErrorEnum.SEMESTER_ALREADY_EXISTS);

    //check if the courses exist and check that they are not repeated
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

    await this.warningsQueue.add('warning', { semesterId: semesterRecord.id });
  }

  async findStudentSemesters(studentId: User['id']) {
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    return this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('ac.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .innerJoin(
        'regulation.courseGpaRanges',
        'range',
        'semesterCourse.degree BETWEEN range.from AND range.to',
      )
      .select([
        'semester.id AS id',
        'semester.startYear AS startYear',
        'semester.endYear AS endYear',
        'semester.semester AS semester',
        'SUM(CASE WHEN range.gpa > 0 THEN course.creditHours ELSE 0 END) as gainedHours',
        'SUM(course.creditHours) as totalHours',
        `CASE 
          WHEN SUM(course.creditHours) > 0 THEN ROUND(SUM(range.gpa * course.creditHours) / SUM(course.creditHours), 2)
          ELSE 0 
        END AS gpa`,
        `JSON_ARRAYAGG(
          JSON_OBJECT(
            "courseId", course.id,
            "code", course.code,
            "name", course.name,
            "creditHours", course.creditHours,
            "degree", semesterCourse.degree,
            "grade", range.name,
            "gpa", ROUND(range.gpa, 2)
          )
        ) AS courses`,
      ])
      .where('student.userId = :studentId', { studentId })
      .groupBy(
        'semester.startYear, semester.endYear, semester.semester, semester.id',
      )
      .orderBy('semester.startYear', 'DESC')
      .addOrderBy('semester.semester', 'DESC')
      .getRawMany();
  }

  async findOne(semesterId: Semester['id']): Promise<SemesterDto> {
    const rawResults = await this.semesterRepo
      .createQueryBuilder('semester')
      .innerJoin('semester.academicInfo', 'AC')
      .innerJoin('AC.student', 'student')
      .innerJoin('student.personalInfo', 'PI')
      .leftJoin('semester.semesterCourses', 'semesterCourse')
      .leftJoin('semesterCourse.course', 'course')
      .select([
        'semester.id AS id',
        'semester.startYear AS startYear',
        'semester.endYear AS endYear',
        'semester.semester AS semester',
        'PI.name AS name',
        'PI.nationalId AS nationalId',
        'PI.universityId AS universityId',
        'course.id AS courseId',
        'semesterCourse.degree AS degree',
      ])
      .where('semester.id = :semesterId', { semesterId })
      .getRawMany<ISemestarData>();

    if (rawResults.length === 0) {
      throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    }

    const first = rawResults[0];
    const semesterCourses = rawResults
      .filter((r) => r.courseId !== null)
      .map((r) => ({
        courseId: r.courseId,
        degree: r.degree,
      }));

    return {
      id: first.id,
      startYear: first.startYear,
      endYear: first.endYear,
      semester: first.semester,
      semesterCourses,
      student: {
        name: first.name,
        nationalId: first.nationalId,
        universityId: first.universityId,
      },
    };
  }

  async test(studentId: User['id']): Promise<SemestersDto[]> {
    const studentExists = await this.studentRepo.existsBy({
      userId: studentId,
    });
    if (!studentExists) {
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    }

    const rawRecords = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.academicInfo', 'ac')
      .innerJoin('ac.regulation', 'regulation')
      .innerJoin('ac.semesters', 'semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .innerJoin(
        'regulation.courseGpaRanges',
        'range',
        'semesterCourse.degree BETWEEN range.from AND range.to',
      )
      .select([
        'semester.id AS semesterId',
        'semester.startYear AS startYear',
        'semester.endYear AS endYear',
        'semester.semester AS semester',
        'course.id AS courseId',
        'course.code AS code',
        'course.name AS name',
        'course.creditHours AS creditHours',
        'semesterCourse.degree AS degree',
        'range.name AS grade',
        'range.gpa AS gpa',
      ])
      .where('student.userId = :studentId', { studentId })
      .orderBy('semester.startYear', 'DESC')
      .addOrderBy('semester.semester', 'DESC')
      .getRawMany();

    const semesterMap = new Map<string, SemestersDto>();

    for (const row of rawRecords) {
      const key = `${row.semesterId}`;
      const semester = semesterMap.get(key) ?? {
        id: row.semesterId,
        startYear: row.startYear,
        endYear: row.endYear,
        semester: row.semester,
        gainedHours: 0,
        totalHours: 0,
        gpa: 0,
        courses: [],
      };
      semester.courses.push({
        courseId: row.courseId,
        code: row.code,
        name: row.name,
        creditHours: row.creditHours,
        degree: row.degree,
        grade: row.grade,
        gpa: row.gpa,
      });
      semesterMap.set(key, semester);
    }

    semesterMap.forEach((semester) => {
      let totalWeightedPoints = 0;
      let totalCreditHours = 0;
      let gainedHours = 0;

      for (const course of semester.courses) {
        totalWeightedPoints += course.gpa * course.creditHours;
        totalCreditHours += course.creditHours;
        if (course.gpa > 0) {
          gainedHours += course.creditHours;
        }
      }

      semester.gpa =
        totalCreditHours === 0
          ? 0
          : parseFloat((totalWeightedPoints / totalCreditHours).toFixed(2));
      semester.totalHours = totalCreditHours;
      semester.gainedHours = gainedHours;
    });

    return Array.from(semesterMap.values());
  }

  async remove(id: Semester['id']) {
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    return this.semesterRepo.remove(semester);
  }
}
