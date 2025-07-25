import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Brackets, DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';
import { RegistrationValidationService } from './registration-validation.service';
import { RegistrationSettings } from './entities/registration-settings.entity';
import { UpdateRegistrationSettings } from './dto/update-registration-settings.dto';
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
import { Plan } from '../plan/entities/plan.entity';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';
import { RequirementCategory } from '../requirement/enums/requirement-category.enum';
import { safeInArray } from 'src/shared/utils/safe-in-array';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    @InjectRepository(RegistrationSettings)
    private readonly registrationSettingsRepo: Repository<RegistrationSettings>,
    @InjectRepository(Plan)
    private readonly planRepo: Repository<Plan>,
    @Inject(forwardRef(() => RegistrationValidationService))
    private readonly registrationValidationService: RegistrationValidationService,
    @InjectQueue(QueuesEnum.NOTIFICATIONS)
    private readonly notificationQueue: Queue,
    private readonly academicInfoService: AcademicInfoService,
    private readonly dataSource: DataSource,
  ) {}

  async registerStudentCourses(
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
      const existingRegistration = await manager.findOne(Registration, {
        where: { academicInfoId: studentId },
      });

      if (existingRegistration) {
        await manager.remove(Registration, existingRegistration);
      }

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

  async UpdateRegistrationSettings(
    updateRegistrationSettings: UpdateRegistrationSettings,
  ) {
    if (updateRegistrationSettings.isOpen !== undefined) {
      await (updateRegistrationSettings.isOpen
        ? this.openRegistration()
        : this.closeReigstration());
    }

    if (updateRegistrationSettings.semester !== undefined) {
      const settings = await this.getSettings();
      await this.registrationSettingsRepo.save({
        ...settings,
        semester: updateRegistrationSettings.semester,
      });
    }
  }

  private async openRegistration() {
    const { id } = await this.getSettings();
    await this.dataSource.transaction(async (manager) => {
      const settings = await manager.findOne(RegistrationSettings, {
        where: { id },
      });
      settings.isOpen = true;
      await manager.save(settings);

      const registrations = await manager.find(Registration);
      await manager.remove(Registration, registrations);
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
      const settings = await manager.findOne(RegistrationSettings, {
        where: { id },
      });
      settings.isOpen = false;
      await manager.save(settings);

      const registrations = await manager.find(Registration);
      await manager.remove(Registration, registrations);
    });
  }

  async getSettings() {
    const settings = await this.registrationSettingsRepo.findOne({ where: {} });
    if (settings) return settings;
    return await this.registrationSettingsRepo.save(
      this.registrationSettingsRepo.create({}),
    );
  }

  async getStudentRegisteredCourses(studentId: Student['userId']) {
    if (!(await this.academicInfoRepo.existsBy({ studentId })))
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);

    const qb = this.registrationRepo
      .createQueryBuilder('registration')
      .innerJoin('registration.registrationCourses', 'registrationCourse')
      .innerJoin('registrationCourse.course', 'course')
      .where('registration.academicInfoId = :studentId', { studentId });

    return this.applyCourseSelectFields(qb).getRawMany();
  }

  async getStudentAvailableCourses(studentId: Student['userId']) {
    const [
      requiredHoursToTakeGradProject,
      gainedHours,
      passedCourseIds,
      programId,
      gradProjectId,
    ] = await Promise.all([
      this.academicInfoService.getRequiredHoursToTakeGradProject(studentId),
      this.academicInfoService.getGainedHours(studentId),
      this.academicInfoService.getPassedCourseIds(studentId),
      this.academicInfoService.getStudentProgramId(studentId),
      this.academicInfoService.getStudentGradProjectId(studentId),
    ]);

    const qb = this.academicInfoRepo
      .createQueryBuilder('academicInfo')
      .leftJoin('academicInfo.regulation', 'regulation')
      .leftJoin('regulation.requirementCourses', 'requirementCourse')
      .leftJoin('requirementCourse.program', 'program')
      .leftJoin('requirementCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite');

    this.applyCourseSelectFields(qb)
      .where('academicInfo.studentId = :studentId', { studentId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('prerequisite.id IS NULL').orWhere(
            'prerequisite.id IN (:...passedCourseIds)',
            { passedCourseIds: safeInArray(passedCourseIds) },
          );
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('requirementCourse.category != :category', {
            category: RequirementCategory.SPECIALIZATION,
          }).orWhere('program.id = :programId', { programId });
        }),
      );

    if (gradProjectId && gainedHours < requiredHoursToTakeGradProject) {
      qb.andWhere('course.id != :gradProjectId', { gradProjectId });
    }

    return qb.getRawMany<Course>();
  }

  async getRecommenedCourses(studentId: Student['userId']) {
    const planId = await this.academicInfoService.getStudentPlanId(studentId);

    if (!planId) {
      throw new ServiceUnavailableException(
        ErrorEnum.RECOMMENDATION_SERVICE_UNAVAILABLE,
      );
    }

    const availableCourses = await this.getStudentAvailableCourses(studentId);
    const availableCourseIds = availableCourses.map((course) => course.id);

    const passedCourseIdsSet = new Set(
      await this.academicInfoService.getPassedCourseIds(studentId),
    );

    const unpassedAvailableCourseIds = availableCourseIds.filter(
      (courseId) => !passedCourseIdsSet.has(courseId),
    );

    const qb = this.planRepo
      .createQueryBuilder('plan')
      .leftJoin('plan.semesterPlans', 'semesterPlan')
      .leftJoin('semesterPlan.semesterPlanCourses', 'semesterPlanCourse')
      .leftJoin('semesterPlanCourse.course', 'course')
      .leftJoin('course.prerequisite', 'prerequisite')
      .where('plan.programId = :planId', { planId })
      .andWhere('course.id IN (:...courseIds)', {
        courseIds: safeInArray(unpassedAvailableCourseIds),
      });

    return this.applyCourseSelectFields(qb)
      .orderBy('semesterPlan.level', 'ASC')
      .addOrderBy('semesterPlan.semester', 'ASC')
      .getRawMany();
  }

  private applyCourseSelectFields(qb: SelectQueryBuilder<any>) {
    return qb
      .select('course.id', 'id')
      .addSelect('course.name', 'name')
      .addSelect('course.code', 'code')
      .addSelect('course.lectureHours', 'lectureHours')
      .addSelect('course.practicalHours', 'practicalHours')
      .addSelect('course.creditHours', 'creditHours');
  }

  private async getStudentsTokens() {
    const fcmTokens = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student.user', 'user')
      .innerJoin('user.fcmTokens', 'fcmToken')
      .select('fcmToken.token', 'token')
      .getRawMany<{ token: string }>();

    return fcmTokens.map((fcmToken) => fcmToken.token);
  }
}
