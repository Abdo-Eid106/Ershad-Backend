import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_PIPE } from '@nestjs/core';
import { validationPipe } from './shared/pipes/validation.pipe';
import { LoggerMiddleware } from './shared/middlewares/logger.middleware';
import { RegulationModule } from './modules/regulation/regulation.module';
import { DatabaseModule } from './shared/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CourseModule } from './modules/course/course.module';
import { ProgramModule } from './modules/program/program.module';
import { PlanModule } from './modules/plan/plan.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { UserModule } from './modules/user/user.module';
import { StudentModule } from './modules/student/student.module';
import { SemesterModule } from './modules/semester/semester.module';
import { PersonalInfoModule } from './modules/personal-info/personal-info.module';
import { AcademicInfoModule } from './modules/academic-info/academic-info.module';
import { AuthModule } from './modules/auth/auth.module';
import { OfficerModule } from './modules/officer/officer.module';
import { RoleModule } from './modules/role/role.module';
import { AdminModule } from './modules/admin/admin.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SummaryModule } from './modules/summary/summary.module';
import { CourseRecommendationModule } from './modules/course-recommendation/course-recommendation.module';
import { OtpModule } from './modules/otp/otp.module';

@Module({
  imports: [
    RegulationModule,
    DatabaseModule,
    CourseModule,
    ProgramModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PlanModule,
    RequirementModule,
    UserModule,
    StudentModule,
    SemesterModule,
    PersonalInfoModule,
    AcademicInfoModule,
    AuthModule,
    OfficerModule,
    RoleModule,
    AdminModule,
    RegistrationModule,
    SummaryModule,
    CourseRecommendationModule,
    OtpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: validationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
