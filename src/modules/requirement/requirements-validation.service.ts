import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { RequirementCourse } from './entities/requirement-course.entity';
import { RequirementCategory } from './enums/requirement-category.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Regulation } from '../regulation/entities';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';

@Injectable()
export class RequirementValidationService {
  constructor(
    @InjectRepository(RequirementCourse)
    private readonly requirementCourseRepo: Repository<RequirementCourse>,

    @InjectRepository(Regulation)
    private readonly regulationRepo: Repository<Regulation>,

    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async validate(createRequirementDto: CreateRequirementDto) {
    const { regulationId, programId, category, courseId } =
      createRequirementDto;

    const regulationExists = await this.doesRegulationExist(regulationId);
    if (!regulationExists) {
      throw new NotFoundException(`Regulation not found`);
    }

    const courseExists = await this.doesCourseExist(courseId);
    if (!courseExists) {
      throw new NotFoundException(`Course not found`);
    }

    if (category === RequirementCategory.SPECIALIZATION) {
      const programExists = await this.doesProgramExist(programId);
      if (!programExists) {
        throw new NotFoundException(`Program not found`);
      }

      const programRequirementExists = await this.doesProgramRequirementExist(
        courseId,
        programId,
      );
      if (programRequirementExists) {
        throw new ConflictException(`Requirement already exists.`);
      }
    } else {
      const regulationRequirementExists =
        await this.doesRegulationRequirementExist(courseId, regulationId);
      if (regulationRequirementExists) {
        throw new ConflictException(`Requirement already exists.`);
      }
    }
  }

  async doesRegulationExist(regulationId: UUID) {
    return this.regulationRepo.existsBy({ id: regulationId });
  }

  async doesCourseExist(courseId: UUID) {
    return this.courseRepo.existsBy({ id: courseId });
  }

  async doesProgramExist(programId?: UUID) {
    return this.programRepo.existsBy({ id: programId });
  }

  async doesProgramRequirementExist(courseId: UUID, programId: UUID) {
    return this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .innerJoin('requirement.course', 'course')
      .innerJoin('requirement.program', 'program')
      .where('course.id = :courseId', { courseId })
      .andWhere('program.id = :programId', { programId })
      .getExists();
  }

  async doesRegulationRequirementExist(courseId: UUID, regulationId: UUID) {
    return this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .innerJoin('requirement.regulation', 'regulation')
      .innerJoin('requirement.course', 'course')
      .where('course.id = :courseId', { courseId })
      .andWhere('regulation.id = :regulationId', { regulationId })
      .getExists();
  }
}
