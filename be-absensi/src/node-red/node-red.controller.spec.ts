import { Test, TestingModule } from '@nestjs/testing';
import { NodeRedController } from './node-red.controller';
import { NodeRedService } from './node-red.service';

describe('NodeRedController', () => {
  let controller: NodeRedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NodeRedController],
      providers: [NodeRedService],
    }).compile();

    controller = module.get<NodeRedController>(NodeRedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
