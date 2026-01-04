import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sid: unknown = request.cookies?.sid;

    if (typeof sid !== 'string') {
      throw new UnauthorizedException();
    }

    return true;
  }
}
