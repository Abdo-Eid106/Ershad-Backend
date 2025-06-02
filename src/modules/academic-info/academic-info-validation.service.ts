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
import { AcademicInfo } from './entities/academic-info.entity';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';
import { User } from '../user/entities/user.entity';

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
    studentId: User['id'],
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
      if (!programExists)
        throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

      const programInRegulation =
        await this.doesProgramExistWithinTheRegulation(programId, regulationId);
      if (!programInRegulation)
        throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);

      const isEligible = await this.isEligibleForSpecialization(studentId);
      if (!isEligible) {
        throw new BadRequestException(
          ErrorEnum.STUDENT_NOT_ELIGIBLE_FOR_SPECIALIZATION,
        );
      }
    }
    return true;
  }

  async doesStudentExist(studentId: User['id']) {
    return this.academicInfoRepo.existsBy({ studentId });
  }

  async doesRegulationExist(regulationId: Regulation['id']) {
    return this.regulationRepo.existsBy({ id: regulationId });
  }

  async doesProgramExist(programId: Program['id']) {
    return this.programRepo.existsBy({ id: programId });
  }

  async doesProgramExistWithinTheRegulation(
    programId: Program['id'],
    regulationId: Regulation['id'],
  ) {
    return this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .where('program.id = :programId', { programId })
      .andWhere('regulation.id = :regulationId', { regulationId })
      .getExists();
  }

  async isEligibleForSpecialization(studentId: User['id']) {
    const gainedHours =
      await this.academicInfoService.getGainedHours(studentId);
    const requiredHours =
      await this.academicInfoService.getRequiredHoursForSpecialization(
        studentId,
      );
    return gainedHours >= requiredHours;
  }
}
