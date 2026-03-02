import { Test, TestingModule } from '@nestjs/testing';
import { PolloptionService } from './polloption.service';

describe('PolloptionService', () => {
  let service: PolloptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PolloptionService],
    }).compile();

    service = module.get<PolloptionService>(PolloptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
