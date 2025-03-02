import { Controller, Get, UseGuards } from '@nestjs/common';
import { CourseRecommendationService } from './course-recommendation.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { CourseDto } from '../course/dto/course.dto';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
export class CourseRecommendationController {
  constructor(
    private readonly courseRecommendationService: CourseRecommendationService,
  ) {}

  @Get('/recommended-courses')
  @Serialize(CourseDto)
  @Roles(RoleEnum.STUDENT)
  getRecommendedCourses(@currentUser() user: IPayloud) {
    return this.courseRecommendationService.getRecommenedCourses(user.id);
  }
}
