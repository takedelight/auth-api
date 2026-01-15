import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { type Request } from 'express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePasswordDto } from './dto/update-password.dto';

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

    return await this.userService.update(id!, dto);
  }

  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() request: Request, @UploadedFile() file: Express.Multer.File) {
    const userId = request.session.userId;

    return await this.userService.updateAvatar(userId!, file);
  }

  @Patch('update-password')
  async updatePassword(@Req() request: Request, @Body() dto: UpdatePasswordDto) {
    const id = request.session.userId;

    return await this.userService.updatePassword(id!, dto);
  }
}
