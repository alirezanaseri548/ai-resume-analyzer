import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  private getUserId(req: any): string {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return userId;
  }

  @Get('me')
  getMySkills(@Req() req: any) {
    return this.skillsService.getMySkills(this.getUserId(req));
  }
}
