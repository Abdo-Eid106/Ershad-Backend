import { Module } from '@nestjs/common';
import { AcademicInfoService } from './academic-info.service';
import { AcademicInfoController } from './academic-info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/entities/student.entity';
import { Regulation } from '../regulation/entities';
import { AcademicInfo } from './entities/academic-info.entity';
import { AcademicInfoValidationService } from './academic-info-validation.service';
import { Program } from '../program/entities/program.entitiy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Regulation, AcademicInfo, Program]),
  ],
  controllers: [AcademicInfoController],
  providers: [AcademicInfoService, AcademicInfoValidationService],
  exports: [AcademicInfoService],
})
export class AcademicInfoModule {}
