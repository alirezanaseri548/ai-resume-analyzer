import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user/profile')
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req?.user?.id || req?.user?.sub);
  }

  @Patch('user/profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.userService.updateProfile(req?.user?.id || req?.user?.sub, body);
  }

  @Get('users/me')
  getMe(@Req() req: any) {
    return this.userService.getProfile(req?.user?.id || req?.user?.sub);
  }

  // AUTO-ADDED: USER_SETTINGS_ENDPOINTS_START

  @Get('user/settings')
  @UseGuards(JwtAuthGuard)
  async getMySettings(@Req() req: any) {
    const userId = req?.user?.sub || req?.user?.id;
    return this.userService.getUserAppSettings(userId);
  }

  @Patch('user/settings')
  @UseGuards(JwtAuthGuard)
  async updateMySettings(@Req() req: any, @Body() body: Record<string, string>) {
    const userId = req?.user?.sub || req?.user?.id;
    return this.userService.updateUserAppSettings(userId, body || {});
  }

  // AUTO-ADDED: USER_SETTINGS_ENDPOINTS_END
}
