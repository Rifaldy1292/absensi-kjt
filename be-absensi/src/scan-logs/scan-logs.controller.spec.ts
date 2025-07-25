import { Test, TestingModule } from '@nestjs/testing';
import { ScanLogsController } from './scan-logs.controller';
import { ScanLogsService } from './scan-logs.service';

describe('ScanLogsController', () => {
  let controller: ScanLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanLogsController],
      providers: [ScanLogsService],
    }).compile();

    controller = module.get<ScanLogsController>(ScanLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
