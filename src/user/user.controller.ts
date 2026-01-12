import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { type Request } from 'express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  async getMe(@Req() request: Request) {
    const id = request.session.userId;

    return await this.userService.getUserById(id!);
  }

  @Patch('/me')
  async updateMe(@Req() request: Request, @Body() dto: UpdateUserDto) {
    const id = request.session.userId;

    console.log(id, dto);
    return await this.userService.update(id!, dto);
  }
}
