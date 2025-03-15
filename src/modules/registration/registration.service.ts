import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
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

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,

    @InjectRepository(RegistrationSettings)
    private readonly registrationSettingsRepo: Repository<RegistrationSettings>,

    private readonly registrationValidationService: RegistrationValidationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(studentId: UUID, createRegistrationDto: CreateRegistrationDto) {
    const registrationSettings = await this.getSettings();
    if (!registrationSettings.isOpen)
      throw new ForbiddenException('registration is currently closed');

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

  async getStudentRegisteredCourses(studentId: UUID) {
    if (!(await this.studentRepo.existsBy({ userId: studentId })))
      throw new NotFoundException('Student not found');

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
}
