import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnalyzeResumeDto {
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  jobDescription?: string;
}
