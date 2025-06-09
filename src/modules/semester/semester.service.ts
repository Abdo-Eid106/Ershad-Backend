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
import { Repository } from 'typeorm';
import { SemesterCourse } from './entities/semester-course.entity';
import { Student } from '../student/entities/student.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { User } from '../user/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { Queue } from 'bullmq';

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
    @InjectQueue(QueuesEnum.WARNNINGS)
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

  async findOne(id: Semester['id']) {
    const semester = await this.semesterRepo
      .createQueryBuilder('semester')
      .innerJoin('semester.semesterCourses', 'semesterCourse')
      .innerJoin('semesterCourse.course', 'course')
      .innerJoin('semester.academicInfo', 'AC')
      .innerJoin('AC.student', 'student')
      .innerJoin('student.personalInfo', 'PI')
      .select([
        'semester.id AS id',
        'semester.startYear AS startYear',
        'semester.endYear AS endYear',
        'semester.semester AS semester',
        `JSON_OBJECT(
          'name', PI.name,
          'nationalId', PI.nationalId,
          'universityId', PI.universityId
        ) AS student`,
        `JSON_ARRAYAGG(
          JSON_OBJECT(
            'courseId', course.id,
            'degree', semesterCourse.degree
          )
        ) AS semesterCourses`,
      ])
      .groupBy('semester.id')
      .where('semester.id = :id', { id })
      .getRawOne();

    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    return semester;
  }

  async remove(id: Semester['id']) {
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    return this.semesterRepo.remove(semester);
  }
}
