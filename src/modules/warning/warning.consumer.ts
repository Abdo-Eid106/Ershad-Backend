import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Student } from '../student/entities/student.entity';
import { Warning } from './entities/warning.entity';
import { Semester } from '../semester/entities/semester.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

interface CourseRecord {
  id: Course['id'];
  gpa: number;
  creditHours: number;
}

@Processor(QueuesEnum.WARNINGS)
export class WarningConsumer extends WorkerHost {
  private readonly logger = new Logger(WarningConsumer.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Warning)
    private readonly warningRepo: Repository<Warning>,
    @InjectRepository(Semester)
    private readonly semesterRepo: Repository<Semester>,
    private readonly academicInfoService: AcademicInfoService,
  ) {
    super();
  }

  async process(job: Job<{ semesterId: Semester['id'] }>): Promise<any> {
    const semester = await this.getSemesterOrThrow(job.data.semesterId);
    await this.throwIfWarningExists(semester.id);

    const courseRecords = await this.getStudentCourseRecords(semester);

    const calculatedGpa = this.computeGpa(courseRecords);
    const requiredGpa = await this.academicInfoService.getMinGpaToGraduate(
      semester.academicInfo.studentId as Student['userId'],
    );
    if (calculatedGpa >= requiredGpa) return;

    const warning = this.warningRepo.create({
      semester,
      gpa: calculatedGpa,
    });
    return this.warningRepo.save(warning);
  }

  async generateWarningIfGpaLow(semesterId: Semester['id']) {
    const semester = await this.getSemesterOrThrow(semesterId);
    await this.throwIfWarningExists(semester.id);

    const courseRecords = await this.getStudentCourseRecords(semester);

    const calculatedGpa = this.computeGpa(courseRecords);
    const requiredGpa = await this.academicInfoService.getMinGpaToGraduate(
      semester.academicInfo.studentId as Student['userId'],
    );
    if (calculatedGpa >= requiredGpa) return;

    const warning = this.warningRepo.create({
      semester,
      gpa: calculatedGpa,
    });
    return this.warningRepo.save(warning);
  }

  async getSemesterOrThrow(semesterId: Semester['id']): Promise<Semester> {
    const semester = await this.semesterRepo.findOne({
      where: { id: semesterId },
      relations: ['academicInfo'],
    });

    if (!semester) throw new NotFoundException(ErrorEnum.SEMESTER_NOT_FOUND);
    return semester;
  }

  async throwIfWarningExists(semesterId: Semester['id']) {
    const doesExist = await this.warningRepo.existsBy({
      semester: { id: semesterId },
    });

    if (doesExist) throw new ConflictException(ErrorEnum.WARNING_EXIST);
  }

  async getStudentCourseRecords(semester: Semester) {
    const { studentId } = semester.academicInfo;
    const { startYear, semester: semesterValue } = semester;

    return this.studentRepo
      .createQueryBuilder('student')
      .leftJoin('student.academicInfo', 'academicInfo')
      .leftJoin('academicInfo.semesters', 'studentSemester')
      .leftJoin('studentSemester.semesterCourses', 'semesterCourse')
      .leftJoin('semesterCourse.course', 'course')
      .leftJoin('academicInfo.regulation', 'regulation')
      .leftJoin(
        'regulation.courseGpaRanges',
        'gpaRange',
        'semesterCourse.degree BETWEEN gpaRange.from AND gpaRange.to',
      )
      .where('student.userId = :studentId', { studentId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('studentSemester.startYear < :startYear').orWhere(
            'studentSemester.startYear = :startYear AND studentSemester.semester <= :semesterValue',
          );
        }),
      )
      .setParameters({ startYear, semesterValue })
      .select([
        'course.id AS id',
        'gpaRange.gpa AS gpa',
        'course.creditHours AS creditHours',
      ])
      .getRawMany<CourseRecord>();
  }

  computeGpa(courseRecords: CourseRecord[]): number {
    const bestGradesMap = new Map<CourseRecord['id'], CourseRecord>();

    for (const record of courseRecords) {
      const existing = bestGradesMap.get(record.id);
      if (!existing || record.gpa > existing.gpa) {
        bestGradesMap.set(record.id, record);
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

  @OnWorkerEvent('progress')
  onJobProgress(job: Job, progress: number) {
    this.logger.log(`[${job.id}] Progress: ${progress}%`);
  }

  @OnWorkerEvent('completed')
  async onJobComplete(job: Job) {
    this.logger.log(`[${job.id}] Completed successfully`);
  }

  @OnWorkerEvent('failed')
  onJobFail(job: Job, error: Error) {
    this.logger.error(`[${job.id}] Failed: ${error.message}`);
  }
}
