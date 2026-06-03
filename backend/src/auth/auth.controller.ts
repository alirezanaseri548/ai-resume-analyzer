import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { randomBytes } from "crypto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Post("register")
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post("send-verification-email")
  async sendVerificationEmail(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException("User not authenticated");

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException("User not found");
    if (user.emailVerified) return { message: "Email already verified" };

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await this.prisma.emailVerificationToken.deleteMany({ where: { userId } });

    await this.prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });

    return this.mailService.sendVerificationEmail(user.email, user.fullName, token);
  }

  @Get("verify-email")
  async verifyEmail(@Query("token") token: string) {
    if (!token) throw new BadRequestException("Token is required");

    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) throw new BadRequestException("Invalid token");
    if (record.expiresAt < new Date()) throw new BadRequestException("Token expired");

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await this.prisma.emailVerificationToken.delete({
      where: { token },
    });

    return { message: "Email verified successfully" };
  }

  // AUTO-ADDED: AUTH_REFRESH_ENDPOINTS_START

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any, @Body() body: any) {
    const refreshToken = body?.refreshToken;
    if (!refreshToken) {
      return { success: false, message: 'refreshToken is required' };
    }

    await this.authService.revokeRefreshToken(refreshToken);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: any) {
    const userId = req?.user?.sub || req?.user?.id;
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    await this.authService.revokeAllUserRefreshTokens(userId);
    return { success: true, message: 'All sessions revoked' };
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const refreshToken = body?.refreshToken;
    if (!refreshToken) {
      return { success: false, message: 'refreshToken is required' };
    }

    return this.authService.refreshSession(refreshToken);
  }

  // AUTO-ADDED: AUTH_REFRESH_ENDPOINTS_END
}
