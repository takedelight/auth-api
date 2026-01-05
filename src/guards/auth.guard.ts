import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { Session } from 'src/types/session.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sid: unknown = request.cookies?.sid;

    if (typeof sid !== 'string') {
      throw new UnauthorizedException("Cookie 'sid' not found");
    }

    const session = await this.redisService.getSession(sid);

    if (session?.userAgent !== request.headers['user-agent']) {
      throw new UnauthorizedException('Invalid session');
    }

    return true;
  }
}
