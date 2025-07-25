import { Module } from '@nestjs/common';
import { ScanLogsService } from './scan-logs.service';
import { ScanLogsController } from './scan-logs.controller';

@Module({
  controllers: [ScanLogsController],
  providers: [ScanLogsService],
})
export class ScanLogsModule {}
