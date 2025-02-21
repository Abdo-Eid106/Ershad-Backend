import { Module } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterCourse } from './entities/semester-course.entity';
import { CourseModule } from '../course/course.module';
import { Student } from '../student/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester, SemesterCourse, Student]),
    CourseModule,
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}
