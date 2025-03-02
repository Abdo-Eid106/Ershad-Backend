import { Controller, Get, Injectable, UseGuards } from '@nestjs/common';
import { AdminDashboardSummaryDto } from './dtos/admin-dashboard-summary.dto';
import { SummaryService } from './summary.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';

@Controller()
@Injectable()
@UseGuards(JwtGuard, RolesGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('/admin/dashboard-summary')
  @Serialize(AdminDashboardSummaryDto)
  @Roles(RoleEnum.ADMIN)
  async getAdminDashboardSummary() {
    return this.summaryService.getAdminDashboardSummary();
  }
}
