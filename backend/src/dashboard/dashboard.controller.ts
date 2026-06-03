import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  private getUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return userId;
  }

  @Get('summary')
  getSummary(@Req() req: any) {
    return this.dashboardService.getSummary(this.getUserId(req));
  }
}
