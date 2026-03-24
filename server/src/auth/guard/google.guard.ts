import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  override handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext
  ) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      this.logger.error(
        `Google OAuth failed: ${err?.message || info?.message || 'Unknown error'}`
      );
      this.logger.debug(
        `Google OAuth query: ${JSON.stringify(request?.query ?? {})}`
      );
      throw err || new UnauthorizedException(info?.message || 'Google OAuth failed');
    }

    return user;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
