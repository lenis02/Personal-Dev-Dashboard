import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  // 소셜아이디 생성 or 반환
  async findBySocialIdOrSave(
    name: string,
    socialId: string,
    provider: string
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { socialId, provider },
    });

    if (!user) {
      user = this.userRepository.create({
        name,
        socialId,
        provider,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  // 리프레시 토큰 업데이트
  async updateRefreshToken(
    socialId: string,
    provider: string,
    refreshToken: string
  ): Promise<void> {
    await this.userRepository.update({ socialId, provider }, { refreshToken });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.userRepository.update({ id: userId }, { refreshToken: null });
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  // findAll() {
  //   return `This action returns all user`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
