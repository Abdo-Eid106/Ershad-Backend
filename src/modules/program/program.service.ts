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
import { UUID } from 'crypto';

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
    if (!regulation) throw new NotFoundException('regulation not found');

    if (await this.programRepo.existsBy({ code }))
      throw new ConflictException('Program with this code already exists');

    const program = this.programRepo.create({
      ...createProgramDto,
      regulation,
    });
    return this.programRepo.save(program);
  }

  async findAll(query: GetProgramsDto) {
    const { regulationId } = query;

    return this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .leftJoin('program.plan', 'plan')
      .select([
        'program.id AS id',
        'program.name AS name',
        'program.code AS code',
        'program.degree AS degree',
        'plan.id AS planId',
        `CASE 
          WHEN plan.id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END AS hasPlan`,
      ])
      .where('regulation.id = :regulationId', { regulationId })
      .getRawMany();
  }

  async findOne(id: UUID) {
    const program = await this.programRepo
      .createQueryBuilder('program')
      .innerJoin('program.regulation', 'regulation')
      .innerJoin('regulation.academicRequirements', 'ac')
      .select([
        'program.id AS id',
        'program.name AS name',
        'program.code AS code',
        'program.degree AS degree',
        'ac.levelsCount as levels',
      ])
      .where('program.id = :id', { id })
      .getRawOne();
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async update(id: UUID, updateProgramDto: UpdateProgramDto) {
    const { code } = updateProgramDto;
    const program = await this.findOne(id);
    if (program.code != code && (await this.programRepo.existsBy({ code })))
      throw new ConflictException('Program with this code already exists');
    this.programRepo.save({ ...program, ...updateProgramDto });
  }

  async remove(id: UUID) {
    const program = await this.findOne(id);
    return this.programRepo.remove(program);
  }
}
