import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class UserService {
  private readonly select = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    avatar: true,
    role: true,
    createdAt: true,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: this.select,
    });
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.select,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const isExist = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (isExist) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        password: await hash(dto.password),
      },
    });

    return newUser;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      dto.password = await hash(dto.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.select,
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const avatarSrc = await this.s3Service.uploadFile(file, 'avatars');

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarSrc },
    });
  }
}
