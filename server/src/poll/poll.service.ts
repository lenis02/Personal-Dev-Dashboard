import { Injectable } from '@nestjs/common';
import { CreatePollDto } from './dto/create-poll.dto';
import { EntityManager } from 'typeorm';
import { Poll, PollOption } from './entities/poll.entity';

@Injectable()
export class PollService {
  async createPoll(
    postId: number,
    createPollDto: CreatePollDto,
    manager: EntityManager
  ): Promise<Poll> {
    const { title, options } = createPollDto;

    const poll = manager.create(Poll, {
      title,
      postId,
    });
    const savedPoll = await manager.save(poll);

    const pollOptions = options.map((text) =>
      manager.create(PollOption, {
        text,
        poll: savedPoll,
      })
    );
    await manager.save(pollOptions);

    return savedPoll;
  }
}
