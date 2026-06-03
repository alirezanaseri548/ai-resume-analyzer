import { Module } from '@nestjs/common';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { MlModule } from '../ml/ml.module';

@Module({
  imports: [AuthModule, MlModule],
  controllers: [ResumeController],
  providers: [ResumeService, PrismaService],
  exports: [ResumeService],
})
export class ResumeModule {}
