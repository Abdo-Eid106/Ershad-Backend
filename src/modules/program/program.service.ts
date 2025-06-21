import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Program } from './entities/program.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProgramDto, GetProgramsDto, UpdateProgramDto } from './dto';
import { Regulation } from '../regulation/entities';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,
  ) {}

  async create(createProgramDto: CreateProgramDto) {
    const { code, regulationId } = createProgramDto;

    const regulation = await this.regulationRepo.findOne({
      where: { id: regulationId },
    });
    if (!regulation)
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);

    if (await this.programRepo.existsBy({ code }))
      throw new ConflictException(ErrorEnum.PROGRAM_ALREADY_EXISTS);

    const program = this.programRepo.create({
      ...createProgramDto,
      regulation,
    });
    return this.programRepo.save(program);
  }

  async findAll(query: GetProgramsDto) {
    const { regulationId } = query;

    const programs = await this.programRepo
      .createQueryBuilder('program')
      .innerJoinAndSelect('program.regulation', 'regulation')
      .leftJoinAndSelect('program.plan', 'plan')
      .leftJoinAndSelect('program.gradProject', 'gradProject')
      .where('regulation.id = :regulationId', { regulationId })
      .getMany();

    return programs.map((program) => ({
      ...program,
      hasPlan: !!program.plan,
      hasGradProject: !!program.gradProject,
    }));
  }

  async findOne(id: Program['id']) {
    const program = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'ac')
      .select('program.id', 'id')
      .addSelect('program.name', 'name')
      .addSelect('program.code', 'code')
      .addSelect('program.degree', 'degree')
      .addSelect('ac.levelsCount', 'levels')
      .where('program.id = :id', { id })
      .getRawOne();

    if (!program) throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);
    return program;
  }

  async update(id: Program['id'], updateProgramDto: UpdateProgramDto) {
    const { code } = updateProgramDto;
    const program = await this.findOne(id);
    if (program.code != code && (await this.programRepo.existsBy({ code })))
      throw new ConflictException(ErrorEnum.PROGRAM_ALREADY_EXISTS);
    return this.programRepo.save({ ...program, ...updateProgramDto });
  }

  async remove(id: Program['id']) {
    const program = await this.findOne(id);
    return this.programRepo.remove(program);
  }
}
