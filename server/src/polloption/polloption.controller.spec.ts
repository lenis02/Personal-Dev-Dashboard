import { Test, TestingModule } from '@nestjs/testing';
import { PolloptionController } from './polloption.controller';

describe('PolloptionController', () => {
  let controller: PolloptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PolloptionController],
    }).compile();

    controller = module.get<PolloptionController>(PolloptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
