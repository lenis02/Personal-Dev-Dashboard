import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '../post/post.module';
import { PollModule } from '../poll/poll.module';
import { PolloptionModule } from '../polloption/polloption.module';
import { VoteModule } from '../vote/vote.module';
import { Post } from '../post/entity/post.entity';
import { Poll, PollOption, Vote } from '../poll/entities/poll.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'] ?? 'localhost',
      port: parseInt(process.env['DB_PORT'] ?? '5432'),
      username: process.env['DB_USER'] ?? 'postgres',
      password: process.env['DB_PASSWORD'] ?? 'password',
      database: process.env['DB_NAME'] ?? 'semi_app',
      autoLoadEntities: false,
      entities: [Post, Poll, PollOption, Vote],
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    VoteModule,
    PolloptionModule,
    PollModule,
    PostModule,
  ],
})
export class AppModule {}
