import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { PaginatedStudentsDto } from './dto/paginated-students.dto';
import { GetStudentsDto } from './dto/get-students.dto';
import { StudentDto } from './dto/student.dto';
import { UUID } from 'crypto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@Controller('students')
// @UseGuards(JwtGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Serialize(StudentDto)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @Serialize(PaginatedStudentsDto)
  findAll(@Query() getStudentsDto: GetStudentsDto) {
    return this.studentService.findAll(getStudentsDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.studentService.remove(id);
  }
}
