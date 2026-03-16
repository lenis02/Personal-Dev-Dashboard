import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService
  ) {}

  async socialLogin(user: User) {
    const payload = {
      socialId: user.socialId,
      provider: user.provider,
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(
      user.socialId!,
      user.provider,
      hashedRefreshToken
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // refreshToken 발급
  async refreshToken(userId: number, refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new ForbiddenException('유효하지 않거나 만료된 refresh 토큰입니다');
    }

    const user = await this.userService.findById(userId);

    // 유저 존재하지 않거나 토큰 만료시
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!isRefreshTokenMatching) {
      throw new ForbiddenException('Access Denied');
    }

    return this.socialLogin(user);
  }

  async logout(userId: number) {
    await this.userService.clearRefreshToken(userId);
    return { message: '성공적으로 로그아웃 되었습니다.'};
  }
}
