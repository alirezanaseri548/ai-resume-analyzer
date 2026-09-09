import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';
import {
  ALLOWED_RESUME_EXTENSIONS,
  MAX_RESUME_FILE_SIZE,
  getResumeExtension,
} from './resume.constants';

@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  private getUserId(req: any): string {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    return userId;
  }

  @Get()
  async findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.resumeService.findAllByUser(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_RESUME_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const extension = getResumeExtension(file.originalname);
        if (
          !ALLOWED_RESUME_EXTENSIONS.includes(
            extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
          )
        ) {
          return callback(
            new BadRequestException(
              'Unsupported resume file type. Allowed types: PDF, DOCX, or TXT.',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = this.getUserId(req);

    if (!file) {
      throw new BadRequestException("Resume file is required");
    }

    return this.resumeService.uploadResume(file, userId);
  }

  @Post(":id/analyze")
  async analyze(@Param("id") id: string, @Req() req: any) {
    const userId = this.getUserId(req);
    return this.resumeService.analyzeResume(id, userId);
  }

  @Get("analysis/latest")
  async latestAnalysis(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.resumeService.getLatestAnalysisSummary(userId);
  }

  @Get("history/all")
  async history(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.resumeService.getHistory(userId);
  }
}


