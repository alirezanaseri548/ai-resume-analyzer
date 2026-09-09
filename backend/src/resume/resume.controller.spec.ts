import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ResumeController', () => {
  let app: INestApplication;
  const resumeService = {
    findAllByUser: jest.fn().mockResolvedValue([]),
    uploadResume: jest.fn().mockResolvedValue({ id: 'resume-1' }),
    analyzeResume: jest
      .fn()
      .mockResolvedValue({ id: 'analysis-1', keywordMatch: 80 }),
    matchResumeToJob: jest
      .fn()
      .mockResolvedValue({ id: 'match-1', matchScore: 80 }),
    getLatestAnalysisSummary: jest.fn().mockResolvedValue({ latest: null }),
    getHistory: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [{ provide: ResumeService, useValue: resumeService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: any) => {
          context.switchToHttp().getRequest().user = { id: 'user-1' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  it('rejects requests without a multipart file', async () => {
    await request(app.getHttpServer()).post('/api/resumes/upload').expect(400);
    expect(resumeService.uploadResume).not.toHaveBeenCalled();
  });

  it('passes job description to the analysis service', async () => {
    await request(app.getHttpServer())
      .post('/api/resumes/resume-1/analyze')
      .send({ jobDescription: 'React TypeScript developer' })
      .expect(201)
      .expect({ id: 'analysis-1', keywordMatch: 80 });

    expect(resumeService.analyzeResume).toHaveBeenCalledWith(
      'resume-1',
      'user-1',
      'React TypeScript developer',
    );
  });

  it('exposes a direct job-match endpoint', async () => {
    await request(app.getHttpServer())
      .post('/api/resumes/resume-1/match')
      .send({ jobDescription: 'React developer' })
      .expect(201)
      .expect({ id: 'match-1', matchScore: 80 });

    expect(resumeService.matchResumeToJob).toHaveBeenCalledWith(
      'resume-1',
      'user-1',
      'React developer',
    );
  });
});
