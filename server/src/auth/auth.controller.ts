import { Controller, Req, Get, Post, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard, JwtRefreshGuard } from './guard/google.guard';
import { User } from '../user/entities/user.entity';

interface JwtPayload {
  sub: number;
  email: string;
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
  ): ReturnType<AuthService['googleLogin']> {
    const user = req.user as User;
    return this.authService.googleLogin(user);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request): ReturnType<AuthService['refreshToken']> {
    const user = req.user as JwtPayload;
    const userId = user.sub;
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!refreshToken) {
      throw new Error('Refresh token is missing in Authorization header');
    }

    return this.authService.refreshToken(userId, refreshToken);
  }
}
