import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ProfileUpdate = {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeUser(user: any) {
    if (!user) {
      return {
        id: null,
        email: '',
        name: '',
        fullName: '',
        firstName: '',
        lastName: '',
        phone: '',
        location: '',
        title: '',
        bio: '',
        emailVerified: false,
      };
    }

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName =
      user.fullName ||
      user.name ||
      [firstName, lastName].filter(Boolean).join(' ') ||
      user.email ||
      '';

    return {
      id: user.id,
      email: user.email || '',
      name: user.name || fullName,
      fullName,
      firstName,
      lastName,
      phone: user.phone || '',
      location: user.location || '',
      title: user.title || '',
      bio: user.bio || '',
      emailVerified: Boolean(user.emailVerified),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getProfile(userId?: string) {
    const user = await this.findUser(userId);
    return this.normalizeUser(user);
  }

  async updateProfile(userId: string | undefined, data: ProfileUpdate) {
    const user = await this.findUser(userId);

    if (!user?.id) {
      return this.normalizeUser(null);
    }

    const safeData: Record<string, any> = {};
    const allowed = ['name', 'fullName', 'firstName', 'lastName', 'phone', 'location', 'title', 'bio'];

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        safeData[key] = (data as any)[key];
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: safeData,
      });

      return this.normalizeUser(updated);
    } catch {
      return this.normalizeUser(user);
    }
  }

  private async findUser(userId?: string) {
    if (userId) {
      try {
        return await this.prisma.user.findUnique({ where: { id: userId } });
      } catch {
        return null;
      }
    }

    try {
      return await this.prisma.user.findFirst({ orderBy: { createdAt: 'desc' } as any });
    } catch {
      return await this.prisma.user.findFirst();
    }
  }

  // AUTO-ADDED: USER_SETTINGS_HELPERS_START
  async getUserAppSettings(userId: string) {
    if (!this.prisma?.appSetting) return [];
    return this.prisma.appSetting.findMany({
      where: { userId },
      orderBy: { key: 'asc' }
    });
  }

  async updateUserAppSettings(userId: string, payload: Record<string, string>) {
    if (!this.prisma?.appSetting) return [];

    const result: any[] = [];
    for (const key of Object.keys(payload || {})) {
      const value = String(payload[key]);

      const existing = await this.prisma.appSetting.findFirst({
        where: { userId, key }
      });

      if (existing) {
        result.push(await this.prisma.appSetting.update({
          where: { id: existing.id },
          data: { value }
        }));
      } else {
        result.push(await this.prisma.appSetting.create({
          data: { userId, key, value }
        }));
      }
    }

    return result;
  }

  async getSafeProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        emailVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
  // AUTO-ADDED: USER_SETTINGS_HELPERS_END
}
