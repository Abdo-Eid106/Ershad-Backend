import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Put,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { GetCoursesDto, CreateCourseDto } from './dto';
import { UUID } from 'crypto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { CourseDto } from './dto/course.dto';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { RoleEnum } from '../role/enums/role.enum';
import { Roles } from '../role/decorators/roles.decorator';

@Controller('courses')
@UseGuards(JwtGuard, RolesGuard)
@Serialize(CourseDto)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() UpdateCourseDto: CreateCourseDto,
  ) {
    return this.courseService.update(id, UpdateCourseDto);
  }

  @Get()
  findMany() {
    return this.courseService.findAll();
  }

  @Get('/available')
  @Roles(RoleEnum.STUDENT)
  findAvailable(@currentUser() user: IPayloud) {
    return this.courseService.findAvailableCourses(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.courseService.findOne(id);
  }

  @Get(':id/details')
  findCourseDetails(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.courseService.findCourseDetails(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id') id: UUID) {
    return this.courseService.remove(id);
  }
}
