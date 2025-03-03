import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { readFileSync } from 'fs';
import {
  Regulation,
  RegistrationRules,
  DismissalRules,
  RetakeRules,
  AcademicRequirements,
  UniversityRequirements,
  BasicScienceRequirements,
  FacultyRequirements,
  SpecializationRequirements,
  Level,
  CourseGpaRange,
  CumGpaRange,
  GradProjectRequirements,
  TrainingRequirements,
} from 'src/modules/regulation/entities';
import { Course } from 'src/modules/course/entites/course.entity';
import { Program } from 'src/modules/program/entities/program.entitiy';
import { Plan } from 'src/modules/plan/entities/plan.entity';
import { RequirementCourse } from 'src/modules/requirement/entities/requirement-course.entity';
import { Registration } from 'src/modules/registration/entities/registration.entity';
import { RegistrationCourse } from 'src/modules/registration/entities/registration-course.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Student } from 'src/modules/student/entities/student.entity';
import { PersonalInfo } from 'src/modules/personal-info/entities/personal-info.entity';
import { AcademicInfo } from 'src/modules/academic-info/entities/academic-info.entity';
import { Semester } from 'src/modules/semester/entities/semester.entity';
import { SemesterCourse } from 'src/modules/semester/entities/semester-course.entity';
import { Officer } from 'src/modules/officer/entities/officer.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Role } from 'src/modules/auth/entities/role.entity';
import { RoleEnum } from 'src/modules/role/enums/role.enum';
import { hash } from 'bcrypt';

const regulations = JSON.parse(
  readFileSync(join(__dirname, 'data', 'regulations.json'), 'utf-8'),
) as Regulation[];
const courses = JSON.parse(
  readFileSync(join(__dirname, 'data', 'courses.json'), 'utf-8'),
) as Course[];
const roles = JSON.parse(
  readFileSync(join(__dirname, 'data', 'roles.json'), 'utf-8'),
) as Role[];
const programs = JSON.parse(
  readFileSync(join(__dirname, 'data', 'programs.json'), 'utf-8'),
) as Program[];
const plans = JSON.parse(
  readFileSync(join(__dirname, 'data', 'plans.json'), 'utf-8'),
) as Plan[];
const requirements = JSON.parse(
  readFileSync(join(__dirname, 'data', 'requirements.json'), 'utf-8'),
) as RequirementCourse[];
const users = JSON.parse(
  readFileSync(join(__dirname, 'data', 'users.json'), 'utf-8'),
) as User[];
const students = JSON.parse(
  readFileSync(join(__dirname, 'data', 'students.json'), 'utf-8'),
) as Student[];
const personalInfos = JSON.parse(
  readFileSync(join(__dirname, 'data', 'personal-info.json'), 'utf-8'),
) as PersonalInfo[];
const academicInfos = JSON.parse(
  readFileSync(join(__dirname, 'data', 'academic-info.json'), 'utf-8'),
) as AcademicInfo[];
const semesters = JSON.parse(
  readFileSync(join(__dirname, 'data', 'semesters.json'), 'utf-8'),
) as Semester[];
const semesterCourses = JSON.parse(
  readFileSync(join(__dirname, 'data', 'semester-courses.json'), 'utf-8'),
) as SemesterCourse[];
const officers = JSON.parse(
  readFileSync(join(__dirname, 'data', 'officers.json'), 'utf-8'),
) as Officer[];

const configService = new ConfigService();
const dataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3306),
  username: configService.get<string>('DB_USER', 'root'),
  password: configService.get<string>('DB_PASSWORD', '12345'),
  database: configService.get<string>('DB_NAME', 'test'),
  entities: [
    Regulation,
    RegistrationRules,
    DismissalRules,
    RetakeRules,
    AcademicRequirements,
    UniversityRequirements,
    BasicScienceRequirements,
    FacultyRequirements,
    SpecializationRequirements,
    CourseGpaRange,
    CumGpaRange,
    GradProjectRequirements,
    TrainingRequirements,
    Level,
    Course,
    Program,
    Plan,
    RequirementCourse,
    User,
    Student,
    PersonalInfo,
    AcademicInfo,
    Semester,
    SemesterCourse,
    Officer,
    Admin,
    Role,
    Registration,
    RegistrationCourse,
  ],
  synchronize: true,
});

const seedDatabase = async () => {
  try {
    await dataSource.initialize();
    const courseRepo = dataSource.getRepository(Course);
    const regulationRepo = dataSource.getRepository(Regulation);
    const roleRepo = dataSource.getRepository(Role);
    const requirementCourseRepo = dataSource.getRepository(RequirementCourse);
    const programRepo = dataSource.getRepository(Program);
    const userRepo = dataSource.getRepository(User);
    const studentRepo = dataSource.getRepository(Student);
    const personalInfoRepo = dataSource.getRepository(PersonalInfo);
    const academicInfoRepo = dataSource.getRepository(AcademicInfo);
    const semesterRepo = dataSource.getRepository(Semester);
    const semesterCourseRepo = dataSource.getRepository(SemesterCourse);
    const officerRepo = dataSource.getRepository(Officer);

    await roleRepo
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(roles)
      .orIgnore()
      .execute();

    regulations.map(async (createRegulationDto) => {
      const {
        levels,
        cumGpaRanges,
        courseGpaRanges,
        registrationRules,
        academicRequirements,
        universityRequirements,
        specializationRequirements,
        facultyRequirements,
        basicScienceRequirements,
        retakeRules,
        dismissalRules,
        ...data
      } = createRegulationDto;

      const { trainingRequirements, gradProjectRequirements, ...specData } =
        specializationRequirements;

      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        if (regulationRepo.existsBy({ id: createRegulationDto.id })) return;
        // Create the main regulation first
        const regulation = await queryRunner.manager.save(Regulation, data);

        // Create levels
        await queryRunner.manager.save(
          Level,
          levels.map((level) => ({ ...level, regulation })),
        );

        // Create cumGpaRanges
        await queryRunner.manager.save(
          CumGpaRange,
          cumGpaRanges.map((range) => ({ ...range, regulation })),
        );

        // Create courseGpaRanges
        await queryRunner.manager.save(
          CourseGpaRange,
          courseGpaRanges.map((range) => ({ ...range, regulation })),
        );

        // Create registrationRules
        await queryRunner.manager.save(RegistrationRules, {
          ...registrationRules,
          regulation,
        });

        // Create academicRequirements
        await queryRunner.manager.save(AcademicRequirements, {
          ...academicRequirements,
          regulation,
        });

        // Create universityRequirements
        await queryRunner.manager.save(UniversityRequirements, {
          ...universityRequirements,
          regulation,
        });

        // Create specializationRequirements
        const specialization = await queryRunner.manager.save(
          SpecializationRequirements,
          { ...specData, regulation },
        );

        // Create trainingRequirements
        await queryRunner.manager.save(TrainingRequirements, {
          ...trainingRequirements,
          specializationRequirements: specialization,
        });

        // Create gradProjectRequirements
        await queryRunner.manager.save(GradProjectRequirements, {
          ...gradProjectRequirements,
          specializationRequirements: specialization,
        });

        // Create facultyRequirements
        await queryRunner.manager.save(FacultyRequirements, {
          ...facultyRequirements,
          regulation,
        });

        // Create basicScienceRequirements
        await queryRunner.manager.save(BasicScienceRequirements, {
          ...basicScienceRequirements,
          regulation,
        });

        // Create retakeRules
        await queryRunner.manager.save(RetakeRules, {
          ...retakeRules,
          regulation,
        });

        // Create dismissalRules
        await queryRunner.manager.save(DismissalRules, {
          ...dismissalRules,
          regulation,
        });

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    });

    await courseRepo
      .createQueryBuilder()
      .insert()
      .into(Course)
      .values(courses)
      .orIgnore()
      .execute();

    await programRepo
      .createQueryBuilder()
      .insert()
      .into(Program)
      .values(programs)
      .orIgnore()
      .execute();

    await requirementCourseRepo
      .createQueryBuilder()
      .insert()
      .into(RequirementCourse)
      .values(requirements)
      .orIgnore()
      .execute();

    await Promise.all(
      users.map(async (user) => {
        const role = await roleRepo.findOne({
          where: { name: user.role as any as RoleEnum },
        });
        return userRepo
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({ ...user, role, password: await hash(user.password, 12) })
          .orIgnore()
          .execute();
      }),
    );

    await studentRepo
      .createQueryBuilder()
      .insert()
      .into(Student)
      .values(students)
      .orIgnore()
      .execute();

    await personalInfoRepo
      .createQueryBuilder()
      .insert()
      .into(PersonalInfo)
      .values(personalInfos)
      .orIgnore()
      .execute();

    await academicInfoRepo
      .createQueryBuilder()
      .insert()
      .into(AcademicInfo)
      .values(academicInfos)
      .orIgnore()
      .execute();

    await semesterRepo
      .createQueryBuilder()
      .insert()
      .into(Semester)
      .values(semesters)
      .orIgnore()
      .execute();

    await semesterCourseRepo
      .createQueryBuilder()
      .insert()
      .into(SemesterCourse)
      .values(semesterCourses)
      .orIgnore()
      .execute();

    await officerRepo
      .createQueryBuilder()
      .insert()
      .into(Officer)
      .values(officers)
      .orIgnore()
      .execute();

    await dataSource.destroy();
  } catch (error) {
    console.log(error);
    await dataSource.destroy();
    process.exit(1);
  }
};

seedDatabase();
