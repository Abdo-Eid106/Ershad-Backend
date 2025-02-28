import { Injectable, NotFoundException } from '@nestjs/common';
import { RequirementCategory } from './enums/requirement-category.enum';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequirementCourse } from './entities/requirement-course.entity';
import { RequirementValidationService } from './requirements-validation.service';
import { GetRequiremetsDto } from './dto/get-requirements.dto';
import { UUID } from 'crypto';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(RequirementCourse)
    private readonly requirementCourseRepo: Repository<RequirementCourse>,
    private readonly requirementValidationService: RequirementValidationService,
  ) {}

  async create(createRequirementDto: CreateRequirementDto) {
    await this.requirementValidationService.validate(createRequirementDto);
    const { courseId, regulationId, programId, category } =
      createRequirementDto;

    return this.requirementCourseRepo.save(
      this.requirementCourseRepo.create({
        ...createRequirementDto,
        course: { id: courseId },
        regulation: { id: regulationId },
        program:
          category == RequirementCategory.SPECIALIZATION
            ? { id: programId }
            : null,
      }),
    );
  }

  async findMany(getRequiremetsDto: GetRequiremetsDto) {
    const { optional, regulationId, category, programId } = getRequiremetsDto;

    const query = this.requirementCourseRepo
      .createQueryBuilder('requirement')
      .leftJoinAndSelect('requirement.course', 'course')
      .leftJoinAndSelect('course.prerequisite', 'prerequisite')
      .where('requirement.regulationId = :regulationId', { regulationId })
      .andWhere('requirement.optional = :optional', {
        optional: optional.toLowerCase() == 'true',
      })
      .andWhere('requirement.category = :category', { category });

    if (category == RequirementCategory.SPECIALIZATION) {
      query.andWhere('requirement.programId = :programId', { programId });
    }

    return query.getMany();
  }

  async remove(id: UUID) {
    const requirement = await this.requirementCourseRepo.findOne({
      where: { id },
    });

    if (!requirement) throw new NotFoundException('requirement not found');
    return this.requirementCourseRepo.remove(requirement);
  }
}
