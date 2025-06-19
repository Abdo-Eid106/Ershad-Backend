import { Module } from '@nestjs/common';
import { RegistrationValidationService } from './registration-validation.service';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entites/course.entity';
import { Registration } from './entities/registration.entity';
import { RegistrationSettings } from './entities/registration-settings.entity';
import { QueueModule } from 'src/shared/queue/queue.module';
import { Plan } from '../plan/entities/plan.entity';
import { AcademicInfo } from '../academic-info/entities/academic-info.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Course,
      Registration,
      Plan,
      RegistrationSettings,
      AcademicInfo,
    ]),
    QueueModule,
    AcademicInfoModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationValidationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
