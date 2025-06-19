import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { In, Repository } from 'typeorm';
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

    const courseExist = await this.courseRepo.existsBy({ code });
    if (courseExist) {
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);
    }

    const course = this.courseRepo.create(createCourseDto);
    course.prerequisite = prerequisiteId
      ? await this.getPrerequisite(prerequisiteId)
      : null;

    return this.courseRepo.save(course);
  }

  private async getPrerequisite(prerequisiteId: Course['id']): Promise<Course> {
    const prerequisite = await this.courseRepo.findOne({
      where: { id: prerequisiteId },
    });
    if (!prerequisite) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return prerequisite;
  }

  async findAll() {
    return this.courseRepo.find({ where: {}, relations: ['prerequisite'] });
  }

  async findByIds(ids: Course['id'][]) {
    ids = [...new Set(ids)];

    const courses = await this.courseRepo.find({ where: { id: In(ids) } });
    if (courses.length != ids.length)
      throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return courses;
  }

  async findOne(id: Course['id']) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['prerequisite'],
    });
    if (!course) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);
    return course;
  }

  async update(id: Course['id'], updateCourseDto: Partial<CreateCourseDto>) {
    const { code, prerequisiteId } = updateCourseDto;

    const course = await this.findOne(id);
    if (code != course.code && (await this.courseRepo.existsBy({ code }))) {
      throw new ConflictException(ErrorEnum.COURSE_ALREADY_EXISTS);
    }

    const prerequisite = prerequisiteId
      ? await this.getPrerequisite(prerequisiteId)
      : null;

    return this.courseRepo.save({
      ...course,
      ...updateCourseDto,
      prerequisite,
    });
  }

  async remove(id: Course['id']) {
    const course = await this.findOne(id);
    return this.courseRepo.remove(course);
  }

  async findCourseDetails(id: Course['id']) {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['prerequisite'],
    });
    if (!course) throw new NotFoundException(ErrorEnum.COURSE_NOT_FOUND);

    const dependentCourses = await this.courseRepo.find({
      where: { prerequisite: { id } },
    });

    return { ...course, dependentCourses };
  }
}
