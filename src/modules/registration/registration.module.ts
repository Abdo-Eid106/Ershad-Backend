import { Module } from '@nestjs/common';
import { RegistrationValidationService } from './registration-validation.service';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entites/course.entity';
import { Registration } from './entities/registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Course, Registration]),
    AcademicInfoModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, RegistrationValidationService],
})
export class RegistrationModule {}
