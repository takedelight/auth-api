import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionService {
  constructor(private readonly prismaService: PrismaService) {}

  async delete(sessionId: string) {
    const session = await this.prismaService.session.delete({ where: { id: sessionId } });

    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return { message: 'Session deleted successfully' };
  }

  async getSessions(sessionId: string) {
    return await this.prismaService.session.findUnique({ where: { sid: sessionId } });
  }
}
