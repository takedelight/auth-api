import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from 'src/session/session.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const sid: unknown = request.cookies?.sid;

    const sessionId = request.sessionID;

    const session = await this.sessionService.getSessions(sessionId);

    if (typeof sid !== 'string' || !session) {
      throw new UnauthorizedException("Cookie 'sid' not found");
    }

    console.log(request.session);

    return true;
  }
}
