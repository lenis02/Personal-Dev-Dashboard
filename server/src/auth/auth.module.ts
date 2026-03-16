import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({}), ConfigModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    KakaoStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
