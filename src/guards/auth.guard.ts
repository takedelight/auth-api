import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sid: unknown = request.cookies?.sid;

    if (typeof sid !== 'string') {
      throw new UnauthorizedException();
    }

    const session = await this.redisService.getSession(sid);

    console.log(session);

    return true;
  }
}
