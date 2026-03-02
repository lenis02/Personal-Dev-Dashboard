import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserSbdDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // 소셜id 기반 유저 찾기
  async findBySocialIdOrSave(
    name: string,
    socialId: string,
    provider: string
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { socialId, provider },
    });

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({
          name,
          socialId,
          provider,
        })
      );
    }
    return user;
  }

  // 리프레쉬 토큰 업데이트
  async updateRefreshToken(
    socialId: string,
    provider: string,
    refreshToken: string | null
  ): Promise<void> {
    await this.userRepository.update({ socialId, provider }, { refreshToken });
  }

  // id 기반 유저 찾기
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  // 키, 몸무게 및 SBD 합 업데이트
  async updateSBD(
    id: number,
    updateUserSbdDto: UpdateUserSbdDto
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    Object.assign(user, updateUserSbdDto);

    return await this.userRepository.save(user);
  }
}
