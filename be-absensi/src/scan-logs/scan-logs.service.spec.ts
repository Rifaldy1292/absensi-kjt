import { Test, TestingModule } from '@nestjs/testing';
import { ScanLogsService } from './scan-logs.service';

describe('ScanLogsService', () => {
  let service: ScanLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanLogsService],
    }).compile();

    service = module.get<ScanLogsService>(ScanLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
