import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateRegulationDto } from './dto/create-regulation.dto';
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
import { UUID } from 'crypto';
import { RegulationValidationService } from './regulation-validation.service';

@Injectable()
export class RegulationService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,

    @InjectRepository(Level)
    private readonly levelRepo: Repository<Level>,

    @InjectRepository(CumGpaRange)
    private readonly cumGpaRangeRepo: Repository<CumGpaRange>,

    @InjectRepository(CourseGpaRange)
    private readonly courseGpaRangeRepo: Repository<CourseGpaRange>,

    @InjectRepository(RegistrationRules)
    private readonly registrationRulesRepo: Repository<RegistrationRules>,

    @InjectRepository(AcademicRequirements)
    private readonly academicRequirementsRepo: Repository<AcademicRequirements>,

    @InjectRepository(UniversityRequirements)
    private readonly universityRequirementsRepo: Repository<UniversityRequirements>,

    @InjectRepository(FacultyRequirements)
    private readonly facultyRequirementsRepo: Repository<FacultyRequirements>,

    @InjectRepository(BasicScienceRequirements)
    private readonly basicScienceRequirementsRepo: Repository<BasicScienceRequirements>,

    @InjectRepository(SpecializationRequirements)
    private readonly specializationRequirementsRepo: Repository<SpecializationRequirements>,

    @InjectRepository(GradProjectRequirements)
    private readonly gradProjectRequirementsRepo: Repository<GradProjectRequirements>,

    @InjectRepository(TrainingRequirements)
    private readonly trainingRequirementsRepo: Repository<TrainingRequirements>,

    @InjectRepository(RetakeRules)
    private readonly retakeRulesRepo: Repository<RetakeRules>,

    @InjectRepository(DismissalRules)
    private readonly dismissalRulesRepo: Repository<DismissalRules>,

    private readonly regulationValidationService: RegulationValidationService,
  ) {}

  async create(createRegulationDto: CreateRegulationDto) {
    this.regulationValidationService.validateRegulation(createRegulationDto);
    const {
      levels,
      cumGpaRanges,
      courseGpaRanges,
      registrationRules,
      academicRequirements,
      universityRequirements,
      specializationRequirements,
      facultyRequirements,
      basicScienceRequirements,
      retakeRules,
      dismissalRules,
      ...data
    } = createRegulationDto;

    const { trainingRequirements, gradProjectRequirements, ...specData } =
      specializationRequirements;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the main regulation first
      const regulation = await queryRunner.manager.save(Regulation, data);

      // Create levels
      await queryRunner.manager.save(
        Level,
        levels.map((level) => ({ ...level, regulation })),
      );

      // Create cumGpaRanges
      await queryRunner.manager.save(
        CumGpaRange,
        cumGpaRanges.map((range) => ({ ...range, regulation })),
      );

      // Create courseGpaRanges
      await queryRunner.manager.save(
        CourseGpaRange,
        courseGpaRanges.map((range) => ({ ...range, regulation })),
      );

      // Create registrationRules
      await queryRunner.manager.save(RegistrationRules, {
        ...registrationRules,
        regulation,
      });

      // Create academicRequirements
      await queryRunner.manager.save(AcademicRequirements, {
        ...academicRequirements,
        regulation,
      });

      // Create universityRequirements
      await queryRunner.manager.save(UniversityRequirements, {
        ...universityRequirements,
        regulation,
      });

      // Create specializationRequirements
      const specialization = await queryRunner.manager.save(
        SpecializationRequirements,
        { ...specData, regulation },
      );

      // Create trainingRequirements
      await queryRunner.manager.save(TrainingRequirements, {
        ...trainingRequirements,
        specializationRequirements: specialization,
      });

      // Create gradProjectRequirements
      await queryRunner.manager.save(GradProjectRequirements, {
        ...gradProjectRequirements,
        specializationRequirements: specialization,
      });

      // Create facultyRequirements
      await queryRunner.manager.save(FacultyRequirements, {
        ...facultyRequirements,
        regulation,
      });

      // Create basicScienceRequirements
      await queryRunner.manager.save(BasicScienceRequirements, {
        ...basicScienceRequirements,
        regulation,
      });

      // Create retakeRules
      await queryRunner.manager.save(RetakeRules, {
        ...retakeRules,
        regulation,
      });

      // Create dismissalRules
      await queryRunner.manager.save(DismissalRules, {
        ...dismissalRules,
        regulation,
      });

      await queryRunner.commitTransaction();

      return this.findOne(regulation.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.regulationRepo.find({
      relations: [
        'levels',
        'cumGpaRanges',
        'courseGpaRanges',
        'registrationRules',
        'academicRequirements',
        'universityRequirements',
        'specializationRequirements',
        'specializationRequirements.trainingRequirements',
        'specializationRequirements.gradProjectRequirements',
        'facultyRequirements',
        'basicScienceRequirements',
        'retakeRules',
        'dismissalRules',
      ],
    });
  }

  async findOne(id: UUID) {
    const regulation = await this.regulationRepo.findOne({
      where: { id },
      relations: [
        'levels',
        'cumGpaRanges',
        'courseGpaRanges',
        'registrationRules',
        'academicRequirements',
        'universityRequirements',
        'specializationRequirements',
        'specializationRequirements.trainingRequirements',
        'specializationRequirements.gradProjectRequirements',
        'facultyRequirements',
        'basicScienceRequirements',
        'retakeRules',
        'dismissalRules',
      ],
    });

    if (!regulation) throw new NotFoundException('Regulation not found');
    return regulation;
  }

  async update(id: UUID, updateRegulationDto: CreateRegulationDto) {
    this.regulationValidationService.validateRegulation(updateRegulationDto);
    await this.findOne(id);

    const {
      levels,
      cumGpaRanges,
      courseGpaRanges,
      registrationRules,
      academicRequirements,
      universityRequirements,
      specializationRequirements,
      facultyRequirements,
      basicScienceRequirements,
      retakeRules,
      dismissalRules,
      ...data
    } = updateRegulationDto;

    const { trainingRequirements, gradProjectRequirements, ...specData } =
      specializationRequirements;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(Level, { regulation: { id } });
      await queryRunner.manager.save(
        Level,
        levels.map((level) => ({ ...level, regulation: { id } })),
      );

      await queryRunner.manager.delete(CumGpaRange, { regulation: { id } });
      await queryRunner.manager.save(
        CumGpaRange,
        cumGpaRanges.map((range) => ({ ...range, regulation: { id } })),
      );

      await queryRunner.manager.delete(CourseGpaRange, { regulation: { id } });
      await queryRunner.manager.save(
        CourseGpaRange,
        courseGpaRanges.map((range) => ({ ...range, regulation: { id } })),
      );

      await queryRunner.manager.update(
        RegistrationRules,
        { regulation: { id } },
        registrationRules,
      );

      await queryRunner.manager.update(
        AcademicRequirements,
        { regulation: { id } },
        academicRequirements,
      );

      await queryRunner.manager.update(
        UniversityRequirements,
        { regulation: { id } },
        universityRequirements,
      );

      // Update specializationRequirements
      await queryRunner.manager.update(
        SpecializationRequirements,
        { regulation: { id } },
        specData,
      );

      const spec = await queryRunner.manager.findOne(
        SpecializationRequirements,
        {
          where: { regulation: { id: id } },
        },
      );

      if (!spec) {
        throw new Error('Specialization requirements not found after update');
      }

      // Update trainingRequirements
      await queryRunner.manager.update(
        TrainingRequirements,
        { specializationRequirements: { id: spec.id } },
        trainingRequirements,
      );

      // Update gradProjectRequirements
      await queryRunner.manager.update(
        GradProjectRequirements,
        { specializationRequirements: { id: spec.id } },
        gradProjectRequirements,
      );

      await queryRunner.manager.update(
        FacultyRequirements,
        { regulation: { id } },
        facultyRequirements,
      );

      await queryRunner.manager.update(
        BasicScienceRequirements,
        { regulation: { id } },
        basicScienceRequirements,
      );

      await queryRunner.manager.update(
        RetakeRules,
        { regulation: { id } },
        retakeRules,
      );

      await queryRunner.manager.update(
        DismissalRules,
        { regulation: { id } },
        dismissalRules,
      );

      await queryRunner.manager.update(Regulation, { id }, data);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: UUID) {
    const regulation = await this.findOne(id);
    return this.regulationRepo.remove(regulation);
  }
}
