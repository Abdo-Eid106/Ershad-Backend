import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSemesterDto, UpdateSemesterDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { CourseService } from '../course/course.service';
import { Repository } from 'typeorm';
import { SemesterCourse } from './entities/semester-course.entity';
import { UUID } from 'crypto';
import { Student } from '../student/entities/student.entity';

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
  ) {}

  async create(studentId: UUID, createSemesterDto: CreateSemesterDto) {
    const { startYear, endYear, semester, semesterCourses } = createSemesterDto;

    //check if the end year is equal to the start year + 1
    if (startYear != endYear - 1)
      throw new BadRequestException('not a valid year range');

    //check if the student is exist
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException('student not found');

    //check if this semester already exist
    if (
      await this.semesterRepo.existsBy({
        startYear,
        semester,
        academicInfo: { studentId },
      })
    )
      throw new ConflictException('semester already exist');

    //check if the courses exist and check that they are not repeated
    const courseIds = [
      ...new Set(
        semesterCourses.map((semesterCourse) => semesterCourse.courseId),
      ),
    ];
    if (courseIds.length != semesterCourses.length)
      throw new ConflictException('course repeated');
    await this.courseService.findByIds(courseIds);

    if (!courseIds.length)
      throw new BadRequestException('you should add at least course');

    const semesterRecord = await this.semesterRepo.save(
      this.semesterRepo.create({
        ...createSemesterDto,
        academicInfo: { studentId },
      }),
    );

    return this.semesterCourseRepo.save(
      semesterCourses.map((semesterCourse) =>
        this.semesterCourseRepo.create({
          semester: { id: semesterRecord.id },
          course: { id: semesterCourse.courseId },
          ...semesterCourse,
        }),
      ),
    );
  }

  async findStudentSemesters(studentId: UUID) {
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException('student not found');

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

  async findOne(id: UUID) {
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

    if (!semester) throw new NotFoundException('semester not found');
    return semester;
  }

  async update(id: UUID, updateSemesterDto: UpdateSemesterDto) {
    const { semesterCourses } = updateSemesterDto;

    //check if the semester exist and get it
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('semester not found');

    //check if the courses exist and check that they are not repeated
    const courseIds = [
      ...new Set(
        semesterCourses.map((semesterCourse) => semesterCourse.courseId),
      ),
    ];
    if (courseIds.length != semesterCourses.length)
      throw new ConflictException('course repeated');
    await this.courseService.findByIds(courseIds);

    if (!courseIds.length)
      throw new BadRequestException('you should add at least course');

    //remove semesterCourses
    await this.semesterCourseRepo.remove(
      await this.semesterCourseRepo.find({ where: { semester: { id } } }),
    );

    //add new semesterCourses
    await this.semesterCourseRepo.save(
      semesterCourses.map((semesterCourse) =>
        this.semesterCourseRepo.create({
          semester: { id },
          course: { id: semesterCourse.courseId },
          ...semesterCourse,
        }),
      ),
    );
  }

  async remove(id: UUID) {
    const semester = await this.semesterRepo.findOne({ where: { id } });
    if (!semester) throw new NotFoundException('semester not found');
    return this.semesterRepo.remove(semester);
  }
}
