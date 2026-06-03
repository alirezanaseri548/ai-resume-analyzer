import { Body, Controller, Get, Param, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly prisma: PrismaService) {}

  private getUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return userId;
  }

  @Get()
  async getReports(@Req() req: any) {
    const userId = this.getUserId(req);

    const items = await this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { items };
  }

  @Get(':id')
  async getReportById(@Param('id') id: string, @Req() req: any) {
    const userId = this.getUserId(req);

    return this.prisma.report.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  @Post('generate')
  async generateReport(@Body() body: any, @Req() req: any) {
    const userId = this.getUserId(req);

    const report = await this.prisma.report.create({
      data: {
        userId,
        title: body?.title || 'Manual Resume Report',
        type: body?.type || ReportType.DASHBOARD_SUMMARY,
        content: body?.content || {
          message: 'Manual report generated',
          generatedAt: new Date().toISOString(),
        },
      },
    });

    return {
      message: 'Report generated successfully',
      report,
    };
  }
}
