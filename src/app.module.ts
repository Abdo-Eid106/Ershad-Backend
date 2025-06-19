import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
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
import { OtpModule } from './modules/otp/otp.module';
import { GradProjectModule } from './modules/grad-project/grad-project.module';
import { TranslationModule } from './shared/i18n/translation.module';
import { I18nExceptionFilter } from './shared/i18n/i18n-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { WarningModule } from './modules/warning/warning.module';
import { FcmTokenModule } from './modules/fcm-token/fcm-token.module';
import { FirebaseModule } from './shared/firebase/firebase.module';
import { NotificationModule } from './modules/notification/notification.module';

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
    OtpModule,
    GradProjectModule,
    TranslationModule,
    WarningModule,
    FcmTokenModule,
    FirebaseModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
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
