import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findByEmailOrSave(
    email: string,
    name: string,
    providerId: string
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({
          email,
          name,
          socialId: providerId,
        })
      );
    }
    return user;
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | null
  ): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.userRepository.create({
      email: dto.email,
      name: dto.name,
    });
  }
}
