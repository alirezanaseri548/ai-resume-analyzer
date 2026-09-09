import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ResumeService } from './resume.service';
import { ResumeStatus } from '@prisma/client';

describe('ResumeService', () => {
  const userId = 'user-1';
  let prisma: any;
  let service: ResumeService;

  beforeEach(() => {
    prisma = {
      resume: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      resumeAnalysis: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      analysisHistory: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      report: {
        create: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
      },
      jobMatch: {
        create: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      dashboardStatCache: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };
    service = new ResumeService(prisma);
  });

  it('rejects unsupported file extensions before touching Prisma', async () => {
    const file = {
      originalname: 'resume.exe',
      mimetype: 'application/octet-stream',
      size: 10,
      buffer: Buffer.from('not a resume'),
    } as Express.Multer.File;

    await expect(service.uploadResume(file, userId)).rejects.toEqual(
      expect.objectContaining({
        response: expect.objectContaining({
          message:
            'Unsupported resume file type. Allowed types: PDF, DOCX, or TXT.',
        }),
      }),
    );
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it('rejects oversized files before writing or persisting them', async () => {
    const file = {
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 10 * 1024 * 1024 + 1,
      buffer: Buffer.alloc(1),
    } as Express.Multer.File;

    await expect(service.uploadResume(file, userId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.resume.create).not.toHaveBeenCalled();
  });

  it('persists a valid text resume and upload history', async () => {
    const resume = {
      id: 'resume-1',
      userId,
      originalFileName: 'resume.txt',
      storedFilePath: '',
      mimeType: 'text/plain',
      fileSize: 32,
      status: ResumeStatus.UPLOADED,
    };
    prisma.resume.create.mockResolvedValue(resume);

    const file = {
      originalname: 'resume.txt',
      mimetype: 'text/plain',
      size: 32,
      buffer: Buffer.from('Skills: TypeScript React\nExperience: 3 years'),
    } as Express.Multer.File;

    const result = await service.uploadResume(file, userId);

    expect(result).toEqual(resume);
    expect(prisma.resume.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originalFileName: 'resume.txt',
          mimeType: 'text/plain',
          fileSize: 32,
          status: ResumeStatus.UPLOADED,
        }),
      }),
    );
    expect(prisma.analysisHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          resumeId: 'resume-1',
        }),
      }),
    );

    const createCall = prisma.resume.create.mock.calls[0][0];
    const storedPath = createCall.data.storedFilePath;
    if (storedPath && fs.existsSync(storedPath)) fs.unlinkSync(storedPath);
  });

  it('enforces ownership and not-found errors during analysis', async () => {
    prisma.resume.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.analyzeResume('missing', userId),
    ).rejects.toBeInstanceOf(NotFoundException);

    prisma.resume.findUnique.mockResolvedValueOnce({
      id: 'resume-2',
      userId: 'another-user',
    });
    await expect(
      service.analyzeResume('resume-2', userId),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('calculates and persists matched and missing job keywords', async () => {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      `resume-test-${Date.now()}.txt`,
    );
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      'Skills: TypeScript, React, Git\nExperience building web apps.',
    );

    prisma.resume.findUnique.mockResolvedValue({
      id: 'resume-3',
      userId,
      originalFileName: 'resume.txt',
      storedFilePath: filePath,
      mimeType: 'text/plain',
      fileSize: 64,
      status: ResumeStatus.UPLOADED,
    });
    prisma.jobMatch.create.mockResolvedValue({
      id: 'match-1',
      resumeId: 'resume-3',
      matchScore: 50,
      matchedSkills: ['TypeScript', 'React'],
      missingSkills: ['Docker'],
    });

    const result = await service.matchResumeToJob(
      'resume-3',
      userId,
      'We need TypeScript, React, and Docker experience.',
    );

    expect(result.id).toBe('match-1');
    expect(prisma.jobMatch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resumeId: 'resume-3',
          jobDescription: expect.stringContaining('Docker'),
          missingSkills: expect.arrayContaining(['Docker']),
          matchedSkills: expect.arrayContaining(['TypeScript', 'React']),
        }),
      }),
    );
    expect(prisma.analysisHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: 'MATCHED_TO_JOB',
        }),
      }),
    );

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  it('requires a non-empty job description for direct matching', async () => {
    await expect(
      service.matchResumeToJob('resume-1', userId, '   '),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.resume.findUnique).not.toHaveBeenCalled();
  });
});
