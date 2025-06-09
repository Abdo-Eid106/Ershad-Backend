import { Module } from '@nestjs/common';
import { WarningService } from './warning.service';
import { WarningController } from './warning.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Warning } from './entities/warning.entity';
import { Semester } from '../semester/entities/semester.entity';
import { AcademicInfoModule } from '../academic-info/academic-info.module';
import { WarningConsumer } from './warning.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Warning, Semester]),
    AcademicInfoModule,
  ],
  providers: [WarningService, WarningConsumer],
  controllers: [WarningController],
})
export class WarningModule {}
