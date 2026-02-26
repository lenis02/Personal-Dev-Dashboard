import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { User } from 'server/src/user/entities/user.entity';
import { UserService } from 'server/src/user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    try {
      const { id, name, emails } = profile;
      const providerId = id;
      const email = emails![0].value;
      const fullname = `${name?.familyName ?? ''}${name?.givenName ?? ''}`;

      const user: User = await this.userService.findByEmailOrSave(
        email,
        fullname,
        providerId
      );

      done(null, user);
    } catch (error) {
      console.error('OAuth validate error:', error);
      done(error, false);
    }
  }
}
