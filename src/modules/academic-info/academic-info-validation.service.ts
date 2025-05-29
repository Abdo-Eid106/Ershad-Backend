import { Repository } from 'typeorm';
import { Regulation } from '../regulation/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Program } from '../program/entities/program.entitiy';
import {
  BadRequestException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { AcademicInfoService } from './academic-info.service';
import { UpdateAcademicInfoDto } from './dto/update-academic-info.dto';
import { UUID } from 'crypto';
import { AcademicInfo } from './entities/academic-info.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

export class AcademicInfoValidationService {
  constructor(
    @InjectRepository(AcademicInfo)
    private readonly academicInfoRepo: Repository<AcademicInfo>,

    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,

    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,

    @Inject(forwardRef(() => AcademicInfoService))
    private readonly academicInfoService: AcademicInfoService,
  ) {}

  async validate(
    studentId: UUID,
    updateAcademicInfoDto: UpdateAcademicInfoDto,
  ) {
    const { programId, regulationId } = updateAcademicInfoDto;

    const studentExist = await this.doesStudentExist(studentId);
    if (!studentExist) {
      throw new NotFoundException(ErrorEnum.STUDENT_NOT_FOUND);
    }

    const regulationExists = await this.doesRegulationExist(regulationId);
    if (!regulationExists) {
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);
    }
    if (programId) {
      const programExists = await this.doesProgramExist(programId);
      if (!programExists) throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

      const programInRegulation =
        await this.doesProgramExistWithinTheRegulation(programId, regulationId);
      if (!programInRegulation)
        throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

      const isEligible = await this.isEligibleForSpecialization(studentId);
      if (!isEligible) {
        throw new BadRequestException(ErrorEnum.STUDENT_NOT_ELIGIBLE_FOR_SPECIALIZATION);
      }
    }
    return true;
  }

  async doesStudentExist(studentId: UUID) {
    return this.academicInfoRepo.existsBy({ studentId });
  }

  async doesRegulationExist(regulationId: UUID) {
    return this.regulationRepo.existsBy({ id: regulationId });
  }

  async doesProgramExist(programId: UUID) {
    return this.programRepo.existsBy({ id: programId });
  }

  async doesProgramExistWithinTheRegulation(
    programId: UUID,
    regulationId: UUID,
  ) {
    return this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .where('program.id = :programId', { programId })
      .andWhere('regulation.id = :regulationId', { regulationId })
      .getExists();
  }

  async isEligibleForSpecialization(studentId: UUID) {
    const gainedHours =
      await this.academicInfoService.getGainedHours(studentId);
    const requiredHours =
      await this.academicInfoService.getRequiredHoursForSpecialization(
        studentId,
      );
    return gainedHours >= requiredHours;
  }
}
