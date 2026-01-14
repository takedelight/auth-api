import { Controller, Delete, Param } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Delete('delete/:id')
  async delete(@Param('id') sessionId: string) {
    return await this.sessionService.delete(sessionId);
  }
}
