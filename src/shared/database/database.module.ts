import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { SemesterPlan } from 'src/modules/plan/entities/semester-plan.entity';
import { SemesterPlanCourse } from 'src/modules/plan/entities/semester-plan-course.entity';
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
import { Otp } from 'src/modules/otp/entities/otp.entity';
import { Role } from 'src/modules/auth/entities/role.entity';
import { RegistrationSettings } from 'src/modules/registration/entities/registration-settings.entity';
import { Warning } from 'src/modules/warning/entities/warning.entity';
import { FcmToken } from 'src/modules/fcm-token/entities/fcm-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
          SemesterPlan,
          SemesterPlanCourse,
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
          Otp,
          RegistrationSettings,
          Warning,
          FcmToken,
        ],
        synchronize: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
