import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UUID } from 'crypto';
import { Repository } from 'typeorm';
import { Course } from './entites/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorEnum } from 'src/shared/i18n/enums/error.enum';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const { code, prerequisiteId } = createCourseDto;

    if (await this.courseRepo.exist({ where: { code } }))
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);

    const course = this.courseRepo.create(createCourseDto);
    course.prerequisite = prerequisiteId
      ? await this.getPrerequisite(prerequisiteId)
      : null;

    return this.courseRepo.save(course);
  }

  private async getPrerequisite(prerequisiteId: UUID): Promise<Course> {
    const prerequisite = await this.courseRepo.findOne({
      where: { id: prerequisiteId },
    });
    if (!prerequisite) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return prerequisite;
  }

  async findAll() {
    return this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.prerequisite', 'prerequisite')
      .getMany();
  }

  async findByIds(ids: UUID[]) {
    if (!ids.length) return [];
    ids = [...new Set(ids)];

    const courses = await this.courseRepo
      .createQueryBuilder('course')
      .where('course.id IN (:...ids)', { ids })
      .getMany();

    if (courses.length != ids.length)
      throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return courses;
  }

  async findOne(id: UUID) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['prerequisite'],
    });
    if (!course) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return course;
  }

  async update(id: UUID, updateCourseDto: Partial<CreateCourseDto>) {
    const { code, prerequisiteId } = updateCourseDto;

    const course = await this.findOne(id);
    if (code != course.code && (await this.courseRepo.existsBy({ code }))) {
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);
    }

    this.courseRepo.merge(course, updateCourseDto);
    course.prerequisite = prerequisiteId
      ? await this.getPrerequisite(prerequisiteId)
      : null;

    return this.courseRepo.save(course);
  }

  async remove(id: UUID) {
    const course = await this.findOne(id);
    return this.courseRepo.remove(course);
  }

  async findCourseDetails(courseId: UUID) {
    const course = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.prerequisite', 'prerequisite')
      .where('course.id = :courseId', { courseId })
      .getOne();
    if (!course) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);

    const dependentCourses = await this.courseRepo.find({
      where: { prerequisite: { id: courseId } },
    });

    return { ...course, dependentCourses };
  }
}
