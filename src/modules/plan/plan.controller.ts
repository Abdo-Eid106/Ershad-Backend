import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { UUID } from 'crypto';
import { PlanDto } from './dto/plan.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';

@Controller('plans')
// @UseGuards(JwtGuard, RolesGuard)
@Serialize(PlanDto)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  create(@Body() CreatePlanDto: CreatePlanDto) {
    return this.planService.create(CreatePlanDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.planService.findOne(id);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles(RoleEnum.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.planService.remove(id);
  }
}
