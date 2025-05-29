import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';
import { RegistrationValidationService } from './registration-validation.service';
import { RegistrationSettings } from './entities/registration-settings.entity';
import { UpdateRegistrationStatus } from './dto/update-registration-status.dto';
import { COURSE_SELECT_FIELDS } from '../course/constants';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    @InjectRepository(RegistrationSettings)
    private readonly registrationSettingsRepo: Repository<RegistrationSettings>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @Inject(forwardRef(() => RegistrationValidationService))
    private readonly registrationValidationService: RegistrationValidationService,
    private readonly academicInfoService: AcademicInfoService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    studentId: Student['userId'],
    createRegistrationDto: CreateRegistrationDto,
  ) {
    const registrationSettings = await this.getSettings();
    if (!registrationSettings.isOpen)
      throw new ForbiddenException(ErrorEnum.REGISTRATION_LIMIT_EXCEEDED);

    await this.registrationValidationService.validate(
      studentId,
      createRegistrationDto,
    );

    const { courseIds } = createRegistrationDto;

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        // Check if a registration already exists and delete it
        await transactionalEntityManager.delete(Registration, {
          academicInfoId: studentId,
        });

        // Create a new Registration entry
        const registration = transactionalEntityManager.create(Registration, {
          academicInfo: { studentId },
        });
        await transactionalEntityManager.save(registration);

        // Create RegistrationCourse entries
        const registrationCourses = courseIds.map((courseId) =>
          transactionalEntityManager.create(RegistrationCourse, {
            registrationId: registration.academicInfoId,
            courseId,
          }),
        );

        await transactionalEntityManager.save(registrationCourses);
        return registration;
      },
    );
  }

  async getStudentRegisteredCourses(studentId: Student['userId']) {
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    return this.registrationRepo
      .createQueryBuilder('registration')
      .innerJoin('registration.registrationCourses', 'registrationCourse')
      .innerJoin('registrationCourse.course', 'course')
      .where('registration.academicInfoId = :studentId', { studentId })
      .select(COURSE_SELECT_FIELDS)
      .getRawMany();
  }

  async updateRegistrationStatus(
    updateRegistrationStatus: UpdateRegistrationStatus,
  ) {
    const settings = await this.getSettings();

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.update(
        RegistrationSettings,
        settings.id,
        updateRegistrationStatus,
      );

      if (updateRegistrationStatus.isOpen) {
        await transactionalEntityManager.delete(Registration, {});
      }
    });
  }

  async getRegistrationStatus() {
    return (await this.getSettings()).isOpen;
  }

  async getSettings() {
    const settings = await this.registrationSettingsRepo.findOne({ where: {} });
    if (settings) return settings;
    return await this.registrationSettingsRepo.save(
      this.registrationSettingsRepo.create({}),
    );
  }

  async getStudentAvailableCourses(studentId: Student['userId']) {
    const program = await this.getStudentProgram(studentId);
    const gradProject = program
      ? await this.getGradProjectCourse(program.id)
      : null;

    const [requiredHoursToTakeGradProject, gainedHours, takenCourseIds] =
      await Promise.all([
        this.academicInfoService.getRequiredHoursToTakeGradProject(studentId),
        this.academicInfoService.getGainedHours(studentId),
        this.academicInfoService.getTakenCourseIds(studentId),
      ]);

    const query = this.studentRepo
      .createQueryBuilder('student')
      .leftJoin('student.academicInfo', 'academicInfo')
      .leftJoin('academicInfo.regulation', 'regulation')
      .leftJoin('regulation.requirementCourses', 'requirementCourses')
      .leftJoin('requirementCourses.program', 'program')
      .leftJoin('requirementCourses.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .select(COURSE_SELECT_FIELDS)
      .where('student.userId = :studentId', { studentId })
      .andWhere(
        '(prerequisite.id IS NULL OR prerequisite.id IN (:...takenCourseIds))',
        { takenCourseIds },
      );

    if (gradProject && gainedHours < requiredHoursToTakeGradProject) {
      query.andWhere('course.id != :gradProjectId', {
        gradProjectId: gradProject.id,
      });
    }

    return (await query.getRawMany()) as Course[];
  }

  private async getStudentProgram(studentId: Student['userId']) {
    return this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.academicInfos', 'academicInfo')
      .where('academicInfo.studentId = :studentId', { studentId })
      .getOne();
  }

  private async getGradProjectCourse(programId: Program['id']) {
    return this.courseRepo.findOne({ where: { id: programId } });
  }
}
