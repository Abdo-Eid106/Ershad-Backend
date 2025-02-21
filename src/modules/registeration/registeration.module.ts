import { Module } from '@nestjs/common';
import { RegisterationController } from './registeration.controller';
import { RegisterationService } from './registeration.service';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entites/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Course]), AcademicInfoModule],
  controllers: [RegisterationController],
  providers: [RegisterationService],
})
export class RegisterationModule {}
