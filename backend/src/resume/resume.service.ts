import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Resume,
  ResumeAnalysis,
  ResumeStatus,
  HistoryEventType,
  ReportType
} from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

type SkillScore = {
  name: string;
  score: number;
  count: number;
  category: string;
  label: string;
};

@Injectable()
export class ResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string): Promise<Resume[]> {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async uploadResume(file: Express.Multer.File, userId: string): Promise<Resume> {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = `${Date.now()}-${file.originalname.replace(/[^\w.\-() ]/g, '_')}`;
    const storedFilePath = path.join(uploadDir, safeFileName);

    if (file.buffer) {
      fs.writeFileSync(storedFilePath, file.buffer);
    }

    const resume = await this.prisma.resume.create({
      data: {
        originalFileName: file.originalname,
        storedFilePath,
        mimeType: file.mimetype || 'application/octet-stream',
        fileSize: file.size || 0,
        status: ResumeStatus.UPLOADED,
        user: { connect: { id: userId } },
      },
    });

    await this.prisma.analysisHistory.create({
      data: {
        userId,
        resumeId: resume.id,
        eventType: HistoryEventType.UPLOADED,
        metadata: {
          fileName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
        },
      },
    });

    return resume;
  }

  async analyzeResume(resumeId: string, userId: string): Promise<ResumeAnalysis> {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.userId !== userId) {
      throw new ForbiddenException('You do not have access to this resume');
    }

    await this.prisma.resume.update({
      where: { id: resumeId },
      data: { status: ResumeStatus.PROCESSING },
    });

    await this.prisma.analysisHistory.create({
      data: {
        userId,
        resumeId,
        eventType: HistoryEventType.PROCESSING,
        metadata: { step: 'analysis-started' },
      },
    });

    try {
      const extractedText = this.extractTextFromStoredFile(resume);
      const result = this.ruleBasedAnalyze(extractedText, resume.originalFileName);

      const analysis = await this.prisma.resumeAnalysis.create({
        data: {
          resumeId,
          extractedText,
          skills: result.skills,
          experienceSummary: result.experienceSummary,
          educationSummary: result.educationSummary,
          atsScore: result.atsScore,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
        },
      });

      await this.prisma.resume.update({
        where: { id: resumeId },
        data: { status: ResumeStatus.ANALYZED },
      });

      await this.prisma.analysisHistory.create({
        data: {
          userId,
          resumeId,
          analysisId: analysis.id,
          eventType: HistoryEventType.ANALYZED,
          metadata: {
            atsScore: result.atsScore,
            keywordMatch: result.keywordMatch,
            readabilityScore: result.readabilityScore,
            skills: result.skills,
          },
        },
      });

      await this.prisma.report.create({
        data: {
          userId,
          title: `Resume Analysis - ${resume.originalFileName}`,
          type: ReportType.RESUME_ANALYSIS,
          content: {
            resumeId,
            analysisId: analysis.id,
            fileName: resume.originalFileName,
            atsScore: result.atsScore,
            keywordMatch: result.keywordMatch,
            readabilityScore: result.readabilityScore,
            skills: result.skills,
            strengths: result.strengths,
            weaknesses: result.weaknesses,
            suggestions: result.suggestions,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      await this.refreshDashboardCache(userId);

      return analysis;
    } catch (error) {
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: { status: ResumeStatus.FAILED },
      });

      await this.prisma.analysisHistory.create({
        data: {
          userId,
          resumeId,
          eventType: HistoryEventType.FAILED,
          metadata: {
            message: error?.message || 'Analysis failed',
          },
        },
      });

      throw error;
    }
  }

  async getLatestAnalysisSummary(userId: string) {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const analyses = await this.prisma.resumeAnalysis.findMany({
      where: {
        resume: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        resume: true,
      },
    });

    if (!analyses.length) {
      return {
        averageAtsScore: 0,
        keywordMatch: 0,
        readabilityScore: 0,
        latest: null,
      };
    }

    const latest = analyses[0];

    const averageAtsScore = Math.round(
      analyses.reduce((sum, item) => sum + Number(item.atsScore || 0), 0) / analyses.length
    );

    const latestSkills = this.normalizeSkills(latest.skills);
    const keywordMatch = this.calculateKeywordMatchFromSkills(latestSkills);
    const readabilityScore = this.calculateReadabilityScore(latest.extractedText || '');

    return {
      averageAtsScore,
      keywordMatch,
      readabilityScore,
      latest,
    };
  }

  async getHistory(userId: string) {
    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.prisma.analysisHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: true,
      },
      take: 50,
    });
  }

  async refreshDashboardCache(userId: string) {
    const resumes = await this.prisma.resume.findMany({
      where: { userId },
      include: {
        analyses: true,
      },
    });

    const totalResumes = resumes.length;
    const analyzedResumes = resumes.filter((r) => r.status === ResumeStatus.ANALYZED).length;

    const scores = resumes
      .flatMap((r) => r.analyses)
      .map((a) => a.atsScore)
      .filter((x): x is number => typeof x === 'number');

    const avgAtsScore =
      scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;

    const allSkills = resumes.flatMap((r) =>
      r.analyses.flatMap((a) => this.normalizeSkills(a.skills))
    );

    const skillMap = new Map<string, { total: number; count: number }>();

    for (const skill of allSkills) {
      const current = skillMap.get(skill.name) || { total: 0, count: 0 };
      current.total += skill.score;
      current.count += 1;
      skillMap.set(skill.name, current);
    }

    const topSkills = Array.from(skillMap.entries())
      .map(([name, value]) => ({
        name,
        score: Math.round(value.total / value.count),
        count: value.count,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const reportCount = await this.prisma.report.count({
      where: { userId },
    });

    await this.prisma.dashboardStatCache.upsert({
      where: { userId },
      update: {
        totalResumes,
        analyzedResumes,
        avgAtsScore,
        topSkills,
        reportCount,
      },
      create: {
        userId,
        totalResumes,
        analyzedResumes,
        avgAtsScore,
        topSkills,
        reportCount,
      },
    });
  }

  private extractTextFromStoredFile(resume: Resume): string {
    let raw = '';

    try {
      if (resume.storedFilePath && fs.existsSync(resume.storedFilePath)) {
        const buffer = fs.readFileSync(resume.storedFilePath);
        raw = buffer.toString('utf8');
      }
    } catch {}

    const cleaned = raw
      .replace(/[^\x20-\x7E\n\r\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return `${resume.originalFileName} ${cleaned}`.trim();
  }

  private ruleBasedAnalyze(text: string, fileName: string) {
    const normalizedText = `${fileName} ${text}`.toLowerCase();

    const skillCatalog: Array<{ name: string; category: string; aliases: string[] }> = [
      { name: 'JavaScript', category: 'Frontend', aliases: ['javascript', 'js', 'ecmascript'] },
      { name: 'TypeScript', category: 'Frontend', aliases: ['typescript', 'ts'] },
      { name: 'React', category: 'Frontend', aliases: ['react', 'reactjs', 'react.js'] },
      { name: 'Next.js', category: 'Frontend', aliases: ['next.js', 'nextjs', 'next'] },
      { name: 'Vue', category: 'Frontend', aliases: ['vue', 'vuejs', 'vue.js'] },
      { name: 'Angular', category: 'Frontend', aliases: ['angular'] },
      { name: 'HTML', category: 'Frontend', aliases: ['html', 'html5'] },
      { name: 'CSS', category: 'Frontend', aliases: ['css', 'css3', 'scss', 'sass', 'tailwind'] },
      { name: 'Node.js', category: 'Backend', aliases: ['node.js', 'nodejs', 'node'] },
      { name: 'NestJS', category: 'Backend', aliases: ['nestjs', 'nest.js'] },
      { name: 'Express', category: 'Backend', aliases: ['express', 'express.js'] },
      { name: 'Python', category: 'Backend', aliases: ['python', 'django', 'flask', 'fastapi'] },
      { name: 'Java', category: 'Backend', aliases: ['java', 'spring', 'spring boot'] },
      { name: 'C#', category: 'Backend', aliases: ['c#', 'csharp', '.net', 'dotnet'] },
      { name: 'SQL', category: 'Database', aliases: ['sql', 'postgresql', 'postgres', 'mysql', 'database'] },
      { name: 'MongoDB', category: 'Database', aliases: ['mongodb', 'mongo'] },
      { name: 'Prisma', category: 'Database', aliases: ['prisma'] },
      { name: 'Docker', category: 'DevOps', aliases: ['docker', 'container'] },
      { name: 'Kubernetes', category: 'DevOps', aliases: ['kubernetes', 'k8s'] },
      { name: 'AWS', category: 'Cloud', aliases: ['aws', 'amazon web services'] },
      { name: 'Git', category: 'Tools', aliases: ['git', 'github', 'gitlab'] },
      { name: 'REST API', category: 'Backend', aliases: ['rest api', 'restful', 'api'] },
      { name: 'GraphQL', category: 'Backend', aliases: ['graphql'] },
      { name: 'Testing', category: 'Quality', aliases: ['test', 'testing', 'jest', 'cypress', 'unit test'] },
      { name: 'Machine Learning', category: 'AI', aliases: ['machine learning', 'ml', 'deep learning', 'ai'] },
    ];

    const skills: SkillScore[] = [];

    for (const skill of skillCatalog) {
      let count = 0;

      for (const alias of skill.aliases) {
        count += this.countOccurrences(normalizedText, alias.toLowerCase());
      }

      if (count > 0) {
        const inExperience = this.hasNearSection(normalizedText, skill.aliases, ['experience', 'work', 'project', 'employment']);
        const inSkills = this.hasNearSection(normalizedText, skill.aliases, ['skills', 'technical skills', 'technologies']);
        const inProjects = this.hasNearSection(normalizedText, skill.aliases, ['project', 'portfolio']);

        let score = 35;
        score += Math.min(count * 12, 36);
        if (inSkills) score += 10;
        if (inExperience) score += 15;
        if (inProjects) score += 10;

        score = Math.max(30, Math.min(100, score));

        skills.push({
          name: skill.name,
          score: Math.round(score),
          count,
          category: skill.category,
          label: score >= 80 ? 'Strong' : score >= 60 ? 'Good' : 'Detected',
        });
      }
    }

    const sortedSkills = skills.sort((a, b) => b.score - a.score);

    const keywordMatch = this.calculateKeywordMatchFromSkills(sortedSkills);
    const readabilityScore = this.calculateReadabilityScore(normalizedText);
    const structureScore = this.calculateStructureScore(normalizedText);
    const skillScore = sortedSkills.length
      ? Math.round(sortedSkills.reduce((sum, s) => sum + s.score, 0) / sortedSkills.length)
      : 0;

    const atsScore = Math.round(
      Math.min(100, Math.max(0, keywordMatch * 0.35 + readabilityScore * 0.25 + structureScore * 0.2 + skillScore * 0.2))
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (sortedSkills.length >= 5) {
      strengths.push('Good technical skill coverage');
    } else {
      weaknesses.push('Limited detected technical skills');
      suggestions.push('Add a dedicated technical skills section with relevant tools and technologies');
    }

    if (readabilityScore >= 75) {
      strengths.push('Resume structure is readable');
    } else {
      weaknesses.push('Resume readability can be improved');
      suggestions.push('Use clearer sections, bullet points, and shorter descriptions');
    }

    if (this.hasNumbers(normalizedText)) {
      strengths.push('Contains measurable achievements');
    } else {
      weaknesses.push('Missing quantified achievements');
      suggestions.push('Add numbers such as percentage improvements, revenue impact, or project scale');
    }

    if (!this.includesAny(normalizedText, ['ci/cd', 'deployment', 'docker', 'cloud', 'aws'])) {
      suggestions.push('Mention deployment, CI/CD, Docker, or cloud experience if applicable');
    }

    return {
      extractedText: text,
      skills: sortedSkills,
      atsScore,
      keywordMatch,
      readabilityScore,
      strengths,
      weaknesses,
      suggestions,
      experienceSummary: this.includesAny(normalizedText, ['experience', 'work', 'employment', 'project'])
        ? 'Experience or project-related content was detected.'
        : 'Experience section is limited or not clearly detected.',
      educationSummary: this.includesAny(normalizedText, ['education', 'university', 'college', 'degree', 'bachelor', 'master'])
        ? 'Education-related information was detected.'
        : 'Education section is limited or not clearly detected.',
    };
  }

  private countOccurrences(text: string, term: string): number {
    if (!term) return 0;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, 'gi');
    return (text.match(regex) || []).length;
  }

  private includesAny(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term.toLowerCase()));
  }

  private hasNumbers(text: string): boolean {
    return /\d+(\.\d+)?\s*(%|percent|users|clients|projects|years|months|revenue|sales|requests|records)?/i.test(text);
  }

  private hasNearSection(text: string, aliases: string[], sections: string[]): boolean {
    for (const section of sections) {
      const sectionIndex = text.indexOf(section.toLowerCase());
      if (sectionIndex === -1) continue;

      const window = text.slice(sectionIndex, sectionIndex + 1200);

      if (aliases.some((alias) => window.includes(alias.toLowerCase()))) {
        return true;
      }
    }

    return false;
  }

  private calculateKeywordMatchFromSkills(skills: SkillScore[]): number {
    if (!skills.length) return 0;

    const important = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'REST API', 'Testing'];
    const detectedImportant = skills.filter((s) => important.includes(s.name)).length;
    const coverage = Math.round((detectedImportant / important.length) * 100);
    const averageSkill = Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length);

    return Math.round(Math.min(100, coverage * 0.55 + averageSkill * 0.45));
  }

  private calculateReadabilityScore(text: string): number {
    if (!text) return 0;

    let score = 30;

    if (text.length > 500) score += 15;
    if (text.length > 1200) score += 10;
    if (this.includesAny(text, ['summary', 'profile', 'objective'])) score += 10;
    if (this.includesAny(text, ['experience', 'work', 'employment'])) score += 15;
    if (this.includesAny(text, ['skills', 'technical skills'])) score += 15;
    if (this.includesAny(text, ['education', 'university', 'degree'])) score += 10;
    if (text.includes('•') || text.includes('- ') || text.includes('* ')) score += 10;
    if (this.hasNumbers(text)) score += 10;

    return Math.min(100, score);
  }

  private calculateStructureScore(text: string): number {
    let score = 0;

    if (this.includesAny(text, ['summary', 'profile', 'objective'])) score += 20;
    if (this.includesAny(text, ['experience', 'work', 'employment'])) score += 25;
    if (this.includesAny(text, ['skills', 'technical skills'])) score += 25;
    if (this.includesAny(text, ['education', 'university', 'degree'])) score += 15;
    if (this.includesAny(text, ['project', 'portfolio'])) score += 15;

    return Math.min(100, score);
  }

  private normalizeSkills(value: any): SkillScore[] {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map((item: any) => {
          if (typeof item === 'string') {
            return {
              name: item,
              score: 60,
              count: 1,
              category: 'General',
              label: 'Detected',
            };
          }

          return {
            name: item.name || item.skill || item.title || '',
            score: Math.round(Number(item.score || item.confidence || item.level || 60)),
            count: Number(item.count || 1),
            category: item.category || 'General',
            label: item.label || 'Detected',
          };
        })
        .filter((item) => item.name);
    }

    return [];
  }
}
