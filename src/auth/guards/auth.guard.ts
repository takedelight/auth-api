import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const sid: unknown = request.cookies?.sid;

    if (typeof sid !== 'string') {
      throw new UnauthorizedException("Cookie 'sid' not found");
    }

    console.log(request.session);

    return true;
  }
}
