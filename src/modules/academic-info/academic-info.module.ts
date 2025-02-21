import { Module } from '@nestjs/common';
import { AcademicInfoService } from './academic-info.service';
import { AcademicInfoController } from './academic-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Regulation } from '../regulation/entities';
import { AcademicInfo } from './entities/academic-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Regulation, AcademicInfo])],
  controllers: [AcademicInfoController],
  providers: [AcademicInfoService],
  exports: [AcademicInfoService],
})
export class AcademicInfoModule {}
