import { Controller, Req, Get, Post, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtRefreshGuard } from './guard/google.guard';
import { User } from '../user/entities/user.entity';
import { KakaoAuthGuard } from './guard/kakao.guard';
import { JwtAccessGuard } from './guard/jwt-access.guard';

interface JwtPayload {
  sub: number;
  socialId: string;
  provider: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(
    @Req() req: Request
  ): ReturnType<AuthService['socialLogin']> {
    const user = req.user as User;
    return this.authService.socialLogin(user);
  }

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoAuth(): Promise<void> {}

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  kakaoAuthRedirect(
    @Req() req: Request
  ): ReturnType<AuthService['socialLogin']> {
    const user = req.user as User;
    return this.authService.socialLogin(user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request): ReturnType<AuthService['refreshToken']> {
    const user = req.user as JwtPayload;
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;
    if (!refreshToken) {
      throw new Error('Refresh token is missing in Authorization header');
    }

    return this.authService.refreshToken(user.sub, refreshToken);
  }

  @UseGuards(JwtAccessGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.authService.logout(user.sub);
  }
}
