import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regulation } from '../regulation/entities';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { Officer } from '../officer/entities/officer.entity';
import { SemesterCourse } from '../semester/entities/semester-course.entity';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Regulation,
      Program,
      Course,
      Officer,
      SemesterCourse,
    ]),
  ],
  providers: [SummaryService],
  controllers: [SummaryController],
  exports: [],
})
export class SummaryModule {}
