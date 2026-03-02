import { Module } from '@nestjs/common';
import { PolloptionController } from './polloption.controller';
import { PolloptionService } from './polloption.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollOption } from './entities/polloption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PollOption])],
  controllers: [PolloptionController],
  providers: [PolloptionService],
})
export class PolloptionModule {}
