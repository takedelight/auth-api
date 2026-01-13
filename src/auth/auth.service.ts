import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'argon2';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { type Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, request: Request) {
    const user = await this.validateUser(dto);

    request.session.userId = user.id;
    request.session.role = user.role;

    console.log(request.session);
  }

  async register(dto: RegisterDto) {
    await this.userService.create(dto);
  }

  async logout(request: Request) {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((err) => {
        if (err instanceof Error) {
          return reject(err);
        }

        request.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'));

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
