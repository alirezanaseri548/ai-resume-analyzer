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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from "./resume.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("resumes")
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

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
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


