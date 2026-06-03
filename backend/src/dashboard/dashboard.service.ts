import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResumeStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const totalResumes = await this.prisma.resume.count({
      where: {},
    });

    const analyzedResumes = await this.prisma.resume.count({
      where: {
        userId,
        status: ResumeStatus.ANALYZED,
      },
    });

    const totalAnalyses = await this.prisma.resumeAnalysis.count({
      where: {
        resume: {
          userId,
        },
      },
    });

    const reportCount = await this.prisma.report.count({
      where: {},
    });

    const avg = await this.prisma.resumeAnalysis.aggregate({
      where: {
        resume: {
          userId,
        },
      },
      _avg: {
        atsScore: true,
      },
    });

    const avgAtsScore = Math.round(avg._avg.atsScore || 0);

    const recentActivity = await this.prisma.analysisHistory.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        resume: true,
      },
    });

    return {
      totalResumes,
      completedAnalysis: analyzedResumes,
      totalAnalyses,
      reportCount,
      avgAtsScore,
      matchedCandidates: analyzedResumes,
      recentActivity,
    };
  }

  // AUTO-ADDED: DASHBOARD_INTELLIGENCE_START
  async getUserSkillInsights(userId: string) {
    if (!this.prisma?.userSkillInsight) return [];
    return this.prisma.userSkillInsight.findMany({
      where: {},
      include: { skill: true }
    });
  }

  async getUserJobMatches(userId: string) {
    if (!this.prisma?.jobMatch) return [];
    return this.prisma.jobMatch.findMany({
      where: {},
      orderBy: { createdAt: 'desc' }
    });
  }
  // AUTO-ADDED: DASHBOARD_INTELLIGENCE_END
}
