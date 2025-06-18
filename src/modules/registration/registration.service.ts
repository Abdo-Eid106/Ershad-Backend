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
import { InjectQueue } from '@nestjs/bullmq';
import { QueuesEnum } from 'src/shared/queue/queues.enum';
import { Queue } from 'bullmq';
import { NotificationTarget } from '../notification/enums/notification.target';
import { NotificationJob } from '../notification/types/NotificationJob';
import { NotficationType } from '../notification/enums/notification.type';
import { NotificationPayload } from '../notification/types/NotificationPayloud';

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
    @InjectQueue(QueuesEnum.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
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

    return await this.dataSource.transaction(async (manager) => {
      await manager.delete(Registration, {
        academicInfoId: studentId,
      });

      const registration = manager.create(Registration, {
        academicInfo: { studentId },
      });
      await manager.save(registration);

      const registrationCourses = courseIds.map((courseId) =>
        manager.create(RegistrationCourse, {
          registrationId: registration.academicInfoId,
          courseId,
        }),
      );

      await manager.save(registrationCourses);
      return registration;
    });
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
    const { isOpen } = updateRegistrationStatus;
    return isOpen ? this.openRegistration() : this.closeReigstration();
  }

  private async openRegistration() {
    const { id } = await this.getSettings();

    await this.dataSource.transaction(async (manager) => {
      await manager.update(RegistrationSettings, id, { isOpen: true });
      await manager.delete(Registration, {});
    });

    const tokens = await this.getStudentsTokens();
    if (tokens.length == 0) return;

    const notification = {
      title: 'Registration is now open!',
      body: 'You can now register for the upcoming semester.',
    };

    const data = {
      id,
      type: NotficationType.REGISTRATION,
    };

    const payload = { notification, data } as NotificationPayload;
    await this.notificationQueue.add(NotificationTarget.MULTIPLE, {
      target: NotificationTarget.MULTIPLE,
      tokens: await this.getStudentsTokens(),
      payload,
    } as NotificationJob);
  }

  private async closeReigstration() {
    const { id } = await this.getSettings();

    return this.dataSource.transaction(async (manager) => {
      await manager.update(RegistrationSettings, id, { isOpen: false });
      await manager.delete(Registration, {});
    });
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

  private async getStudentsTokens() {
    const fcmTokens = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .innerJoin('user.fcmTokens', 'fcmToken')
      .select('fcmToken.token AS token')
      .getRawMany<{ token: string }>();

    return fcmTokens.map((fcmToken) => fcmToken.token);
  }
}
