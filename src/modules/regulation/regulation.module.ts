import { Module } from '@nestjs/common';
import { RegulationService } from './regulation.service';
import { RegulationController } from './regulation.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegulationValidationService } from './regulation-validation.service';
import {
  Regulation,
  RegistrationRules,
  DismissalRules,
  RetakeRules,
  AcademicRequirements,
  UniversityRequirements,
  BasicScienceRequirements,
  FacultyRequirements,
  SpecializationRequirements,
  Level,
  CourseGpaRange,
  CumGpaRange,
  GradProjectRequirements,
  TrainingRequirements,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([
      Regulation,
      RegistrationRules,
      DismissalRules,
      RetakeRules,
      AcademicRequirements,
      UniversityRequirements,
      BasicScienceRequirements,
      FacultyRequirements,
      SpecializationRequirements,
      Level,
      CourseGpaRange,
      CumGpaRange,
      GradProjectRequirements,
      TrainingRequirements,
    ]),
  ],
  controllers: [RegulationController],
  providers: [RegulationService, RegulationValidationService],
})
export class RegulationModule {}
