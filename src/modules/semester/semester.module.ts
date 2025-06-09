import { Module } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { SemesterController } from './semester.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemesterCourse } from './entities/semester-course.entity';
import { CourseModule } from '../course/course.module';
import { Student } from '../student/entities/student.entity';
import { QueueModule } from 'src/shared/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Semester, SemesterCourse, Student]),
    CourseModule,
    QueueModule,
  ],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}
