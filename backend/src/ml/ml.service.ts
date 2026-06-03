import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MlService {
  private readonly logger = new Logger(MlService.name);

  async analyzeResume(filePath: string) {
    const mlUrl = process.env.ML_SERVICE_URL;

    if (!mlUrl) {
      this.logger.warn('ML_SERVICE_URL not set.');
      throw new Error('ML_SERVICE_URL not set');
    }

    this.logger.log(`Sending analyze request to ML service: ${mlUrl}/analyze`);

    const response = await axios.post(
      `${mlUrl}/analyze`,
      { filePath },
      { timeout: 15000 },
    );

    return response.data;
  }
}
