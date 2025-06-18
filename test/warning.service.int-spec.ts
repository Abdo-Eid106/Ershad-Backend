import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarningService } from '../src/modules/warning/warning.service';
import { Student } from '../src/modules/student/entities/student.entity';
import { User } from '../src/modules/user/entities/user.entity';
import { Course } from '../src/modules/course/entites/course.entity';
import { AcademicInfo } from '../src/modules/academic-info/entities/academic-info.entity';
import { Semester } from '../src/modules/semester/entities/semester.entity';
import { ErrorEnum } from '../src/shared/i18n/enums/error.enum';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('WarningService (integration)', () => {
  let service: WarningService;
  let studentRepo: Repository<Student>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Student, User, Course, AcademicInfo, Semester],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Student]),
      ],
      providers: [WarningService],
    }).compile();

    service = module.get<WarningService>(WarningService);
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
  });

  afterAll(async () => {
    // Optionally close the connection if needed
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //   it('should throw NotFoundException if student not found', async () => {
  //     await expect(service.getStudentCourses('non-existent-id')).rejects.toThrow(ErrorEnum.STUDENT_NOT_FOUND);
  //   });

  // Add more tests for happy path, etc.
});
