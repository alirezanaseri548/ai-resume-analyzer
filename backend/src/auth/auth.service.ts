import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async register(data: any) {
    const hash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: hash,
      },
    });
  }

  async login(email: string, pass: string) {
    console.log("LOGIN ATTEMPT:", email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log("USER FOUND:", user ? user.email : "NO");

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid password");
    }

    return {
      access_token: this.jwt.sign({
        sub: user.id,
        email: user.email,
      }),
      user,
    };
  }

  // AUTO-ADDED: AUTH_SECURITY_HELPERS_START
  async hashTokenValue(rawToken: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  getRefreshExpiryDate(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 7);
    return now;
  }

  async storeRefreshToken(userId: string, rawToken: string) {
    if (!this.prisma?.refreshToken) return;

    const tokenHash = await this.hashTokenValue(rawToken);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: this.getRefreshExpiryDate()
      }
    });
  }

  async revokeRefreshToken(rawToken: string) {
    if (!this.prisma?.refreshToken) return;

    const tokenHash = await this.hashTokenValue(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    if (!this.prisma?.refreshToken) return;

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });
  }

  async resolveAppSetting(userId: string, key: string, fallbackValue: string): Promise<string> {
    if (!this.prisma?.appSetting) return fallbackValue;

    const row = await this.prisma.appSetting.findFirst({
      where: { userId, key }
    });

    return row?.value ?? fallbackValue;
  }

  async refreshSession(refreshToken: string) {
    if (!this.prisma?.refreshToken) {
      return { success: false, message: 'RefreshToken model unavailable' };
    }

    const tokenHash = await this.hashTokenValue(refreshToken);

    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null
      },
      include: {
        user: true
      }
    });

    if (!record) {
      return { success: false, message: 'Invalid refresh token' };
    }

    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() }
      });
      return { success: false, message: 'Refresh token expired' };
    }

    return {
      success: true,
      message: 'Refresh token is valid',
      user: {
        id: record.user?.id,
        email: record.user?.email,
        fullName: record.user?.fullName,
        role: record.user?.role,
        emailVerified: record.user?.emailVerified
      }
    };
  }
  // AUTO-ADDED: AUTH_SECURITY_HELPERS_END
}
