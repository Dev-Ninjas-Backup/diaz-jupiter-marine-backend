import { PermissionEnum } from '@/common/enum/permission.enum';
import { RequirePermission } from '@/common/jwt/jwt.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './services/dashboard.service';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RequirePermission(PermissionEnum.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get admin dashboard summary stats' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('recent-activity')
  @RequirePermission(PermissionEnum.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get recent admin activities' })
  getRecentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('performance-overview')
  @RequirePermission(PermissionEnum.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Get performance overview metrics' })
  getPerformanceOverview() {
    return this.dashboardService.getPerformanceOverview();
  }
}
