import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID')!,
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL')!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ) {
    try {
      const { id, _json } = profile;
      const socialId = id;

      const nickname = _json.properties?.nickname || 'User';

      const user: User = await this.userService.findBySocialIdOrSave(
        nickname,
        socialId,
        'kakao'
      );
      return done(null, user);
    } catch (error) {
      console.error('Kakao OAuth validate error:', error);
      return done(error, false);
    }
  }
}
