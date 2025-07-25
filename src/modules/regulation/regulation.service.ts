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
import { RegulationValidationService } from './regulation-validation.service';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { Student } from '../student/entities/student.entity';

@Injectable()
export class RegulationService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
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
      const regulation = await queryRunner.manager.save(Regulation, data);

      await queryRunner.manager.save(
        Level,
        levels.map((level) => ({ ...level, regulation })),
      );

      await queryRunner.manager.save(
        CumGpaRange,
        cumGpaRanges.map((range) => ({ ...range, regulation })),
      );

      await queryRunner.manager.save(
        CourseGpaRange,
        courseGpaRanges.map((range) => ({ ...range, regulation })),
      );

      await queryRunner.manager.save(RegistrationRules, {
        ...registrationRules,
        regulation,
      });

      await queryRunner.manager.save(AcademicRequirements, {
        ...academicRequirements,
        regulation,
      });

      await queryRunner.manager.save(UniversityRequirements, {
        ...universityRequirements,
        regulation,
      });

      const specialization = await queryRunner.manager.save(
        SpecializationRequirements,
        { ...specData, regulation },
      );

      await queryRunner.manager.save(TrainingRequirements, {
        ...trainingRequirements,
        specializationRequirements: specialization,
      });

      await queryRunner.manager.save(GradProjectRequirements, {
        ...gradProjectRequirements,
        specializationRequirements: specialization,
      });

      await queryRunner.manager.save(FacultyRequirements, {
        ...facultyRequirements,
        regulation,
      });

      await queryRunner.manager.save(BasicScienceRequirements, {
        ...basicScienceRequirements,
        regulation,
      });

      await queryRunner.manager.save(RetakeRules, {
        ...retakeRules,
        regulation,
      });

      await queryRunner.manager.save(DismissalRules, {
        ...dismissalRules,
        regulation,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.regulationRepo.find();
  }

  async findOne(id: Regulation['id']) {
    const regulation = await this.regulationRepo
      .createQueryBuilder('regulation')
      .innerJoinAndSelect('regulation.levels', 'levels')
      .orderBy('levels.value', 'ASC')
      .innerJoinAndSelect('regulation.cumGpaRanges', 'cumGpaRanges')
      .addOrderBy('cumGpaRanges.from', 'DESC')
      .innerJoinAndSelect('regulation.courseGpaRanges', 'courseGpaRanges')
      .addOrderBy('courseGpaRanges.from', 'DESC')
      .innerJoinAndSelect('regulation.registrationRules', 'registrationRules')
      .innerJoinAndSelect(
        'regulation.academicRequirements',
        'academicRequirements',
      )
      .innerJoinAndSelect(
        'regulation.universityRequirements',
        'universityRequirements',
      )
      .innerJoinAndSelect(
        'regulation.specializationRequirements',
        'specializationRequirements',
      )
      .innerJoinAndSelect(
        'specializationRequirements.trainingRequirements',
        'trainingRequirements',
      )
      .innerJoinAndSelect(
        'specializationRequirements.gradProjectRequirements',
        'gradProjectRequirements',
      )
      .innerJoinAndSelect(
        'regulation.facultyRequirements',
        'facultyRequirements',
      )
      .innerJoinAndSelect(
        'regulation.basicScienceRequirements',
        'basicScienceRequirements',
      )
      .innerJoinAndSelect('regulation.retakeRules', 'retakeRules')
      .innerJoinAndSelect('regulation.dismissalRules', 'dismissalRules')
      .where('regulation.id = :id', { id })
      .getOne();

    if (!regulation)
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);
    return regulation;
  }

  async getStudentRegulation(studentId: Student['userId']) {
    const regulation = await this.regulationRepo
      .createQueryBuilder('regulation')
      .innerJoinAndSelect('regulation.levels', 'levels')
      .orderBy('levels.value', 'ASC')
      .innerJoinAndSelect('regulation.cumGpaRanges', 'cumGpaRanges')
      .addOrderBy('cumGpaRanges.from', 'DESC')
      .innerJoinAndSelect('regulation.courseGpaRanges', 'courseGpaRanges')
      .addOrderBy('courseGpaRanges.from', 'DESC')
      .innerJoinAndSelect('regulation.registrationRules', 'registrationRules')
      .innerJoinAndSelect(
        'regulation.academicRequirements',
        'academicRequirements',
      )
      .innerJoinAndSelect(
        'regulation.universityRequirements',
        'universityRequirements',
      )
      .innerJoinAndSelect(
        'regulation.specializationRequirements',
        'specializationRequirements',
      )
      .innerJoinAndSelect(
        'specializationRequirements.trainingRequirements',
        'trainingRequirements',
      )
      .innerJoinAndSelect(
        'specializationRequirements.gradProjectRequirements',
        'gradProjectRequirements',
      )
      .innerJoinAndSelect(
        'regulation.facultyRequirements',
        'facultyRequirements',
      )
      .innerJoinAndSelect(
        'regulation.basicScienceRequirements',
        'basicScienceRequirements',
      )
      .innerJoinAndSelect('regulation.retakeRules', 'retakeRules')
      .innerJoinAndSelect('regulation.dismissalRules', 'dismissalRules')
      .innerJoin('regulation.academicInfos', 'ac')
      .where('ac.studentId = :studentId', { studentId })
      .getOne();

    if (!regulation)
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);
    return regulation;
  }

  async update(id: Regulation['id'], updateRegulationDto: CreateRegulationDto) {
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

      await queryRunner.manager.update(
        SpecializationRequirements,
        { regulation: { id } },
        specData,
      );

      const spec = await queryRunner.manager.findOne(
        SpecializationRequirements,
        {
          where: { regulation: { id } },
        },
      );

      await queryRunner.manager.update(
        TrainingRequirements,
        { specializationRequirements: { id: spec.id } },
        trainingRequirements,
      );

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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: Regulation['id']) {
    const regulation = await this.regulationRepo.findOne({ where: { id } });
    if (!regulation) {
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);
    }
    return this.regulationRepo.remove(regulation);
  }
}
