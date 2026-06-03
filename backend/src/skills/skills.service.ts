import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SkillItem = {
  id: string;
  name: string;
  score: number;
  count: number;
  category: string;
  label: string;
  level: number;
};

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySkills(userId: string): Promise<SkillItem[]> {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const analyses = await this.prisma.resumeAnalysis.findMany({
      where: {
        resume: {
          userId,
        },
      },
      include: {
        resume: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const map = new Map<string, {
      name: string;
      totalScore: number;
      count: number;
      category: string;
      totalMentions: number;
    }>();

    for (const analysis of analyses) {
      const skills = this.normalizeSkills(analysis.skills);

      for (const skill of skills) {
        const key = skill.name.toLowerCase();
        const current = map.get(key) || {
          name: skill.name,
          totalScore: 0,
          count: 0,
          category: skill.category || 'General',
          totalMentions: 0,
        };

        current.totalScore += skill.score;
        current.count += 1;
        current.totalMentions += skill.count || 1;
        current.category = skill.category || current.category;

        map.set(key, current);
      }
    }

    return Array.from(map.values())
      .map((item, index) => {
        const score = Math.round(item.totalScore / item.count);

        return {
          id: `${index}-${item.name}`,
          name: item.name,
          score,
          level: score,
          count: item.count,
          category: item.category,
          label: score >= 80 ? 'Strong' : score >= 65 ? 'Good' : score >= 45 ? 'Detected' : 'Low',
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private normalizeSkills(value: any) {
    if (!value || !Array.isArray(value)) return [];

    return value
      .map((item: any) => {
        if (typeof item === 'string') {
          return {
            name: item,
            score: 60,
            count: 1,
            category: 'General',
          };
        }

        return {
          name: item.name || item.skill || item.title || '',
          score: Math.round(Number(item.score || item.confidence || item.level || 60)),
          count: Number(item.count || 1),
          category: item.category || 'General',
        };
      })
      .filter((item) => item.name);
  }
}
