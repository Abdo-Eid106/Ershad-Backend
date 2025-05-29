import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { CourseDto } from './dto/course.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { RoleEnum } from '../role/enums/role.enum';
import { Roles } from '../role/decorators/roles.decorator';
import { Course } from './entites/course.entity';

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
    @Param('id', ParseUUIDPipe) id: Course['id'],
    @Body() UpdateCourseDto: CreateCourseDto,
  ) {
    return this.courseService.update(id, UpdateCourseDto);
  }

  @Get()
  findMany() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: Course['id']) {
    return this.courseService.findOne(id);
  }

  @Get(':id/details')
  findCourseDetails(@Param('id', ParseUUIDPipe) id: Course['id']) {
    return this.courseService.findCourseDetails(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id') id: Course['id']) {
    return this.courseService.remove(id);
  }
}
