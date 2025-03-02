import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Course } from '../course/entites/course.entity';
import { AcademicInfoService } from '../academic-info/academic-info.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { Registration } from './entities/registration.entity';
import { RegistrationCourse } from './entities/registration-course.entity';
import { RegistrationValidationService } from './registration-validation.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
    private readonly registrationValidationService: RegistrationValidationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(studentId: UUID, createRegistrationDto: CreateRegistrationDto) {
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

    const registeredCourses = await this.registrationRepo
      .createQueryBuilder('registration')
      .innerJoin('registration.registrationCourses', 'registrationCourse')
      .innerJoin('registrationCourse.course', 'course')
      .where('registration.academicInfoId = :studentId', { studentId })
      .select([
        'course.id AS id',
        'course.name AS name',
        'course.code AS code',
        'course.lectureHours AS lectureHours',
        'course.practicalHours AS practicalHours',
        'course.creditHours AS creditHours',
      ])
      .getRawMany();

    if (registeredCourses.length === 0)
      throw new NotFoundException(`Student hasn't registered yet`);

    return registeredCourses;
  }
}
