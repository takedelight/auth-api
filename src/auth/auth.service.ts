import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { type Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UAParser } from 'ua-parser-js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService,
    private readonly primsaService: PrismaService,
  ) {}
  async login(dto: LoginDto, request: Request) {
    const user = await this.validateUser(dto);

    const parser = new UAParser(dto.userAgent);

    const userAgent = parser.getResult().browser.name;

    request.session.userId = user.id;
    request.session.role = user.role;
    request.session.userAgent = userAgent;

    await new Promise<void>((resolve, reject) => {
      request.session.save((err) => {
        if (err instanceof Error) {
          return reject(err);
        }

        resolve();
      });
    });
    await this.primsaService.session.update({
      where: { sid: request.sessionID },
      data: {
        userId: user.id,
        userAgent,
      },
    });

    return { success: true };
  }

  async register(dto: RegisterDto) {
    await this.userService.create(dto);
  }

  async logout(request: Request) {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((err) => {
        if (err instanceof Error) return reject(err);

        request.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'), {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_middENV === 'production',
          sameSite: 'lax',
        });

        resolve();
      });
    });

    return { message: 'User logged out successfully' };
  }

  private async validateUser({ email, password }: LoginDto) {
    const user = await this.userService.getUserByEmail(email);

    const isValid = await verify(user.password, password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
