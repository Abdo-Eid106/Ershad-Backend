import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { RequirementCourse } from './entities/requirement-course.entity';
import { RequirementCategory } from './enums/requirement-category.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Regulation } from '../regulation/entities';
import { Program } from '../program/entities/program.entitiy';
import { Course } from '../course/entites/course.entity';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

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
      throw new NotFoundException(ErrorEnum.REGULATION_NOT_FOUND);
    }

    const courseExists = await this.doesCourseExist(courseId);
    if (!courseExists) {
      throw new NotFoundException(ErrorEnum.COURSES_NOT_EXIST);
    }

    if (category === RequirementCategory.SPECIALIZATION) {
      const programExists = await this.doesProgramExist(programId);
      if (!programExists) {
        throw new NotFoundException(ErrorEnum.PROGRAM_NOT_FOUND);
      }

      const programRequirementExists = await this.doesProgramRequirementExist(
        courseId,
        programId,
      );
      if (programRequirementExists) {
        throw new ConflictException(ErrorEnum.REQUIREMENT_ALREADY_EXISTS);
      }
    } else {
      const regulationRequirementExists =
        await this.doesRegulationRequirementExist(courseId, regulationId);
      if (regulationRequirementExists) {
        throw new ConflictException(ErrorEnum.REQUIREMENT_ALREADY_EXISTS);
      }
    }
  }

  async doesRegulationExist(regulationId: Regulation['id']) {
    return this.regulationRepo.existsBy({ id: regulationId });
  }

  async doesCourseExist(courseId: Course['id']) {
    return this.courseRepo.existsBy({ id: courseId });
  }

  async doesProgramExist(programId?: Program['id']) {
    return this.programRepo.existsBy({ id: programId });
  }

  async doesProgramRequirementExist(courseId: Course['id'], programId: Program['id']) {
    return this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .innerJoin('requirement.course', 'course')
      .innerJoin('requirement.program', 'program')
      .where('course.id = :courseId', { courseId })
      .andWhere('program.id = :programId', { programId })
      .getExists();
  }

  async doesRegulationRequirementExist(courseId: Course['id'], regulationId: Regulation['id']) {
    return this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .innerJoin('requirement.regulation', 'regulation')
      .innerJoin('requirement.course', 'course')
      .where('course.id = :courseId', { courseId })
      .andWhere('regulation.id = :regulationId', { regulationId })
      .getExists();
  }
}
