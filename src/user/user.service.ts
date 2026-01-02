import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async getAllUsers() {
    return await this.userRepository.find({ select: { password: false } });
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const isExist = await this.userRepository.findOne({ where: { email: dto.email } });

    if (isExist) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = this.userRepository.create({ ...dto, password: await hash(dto.password) });

    return await this.userRepository.save(newUser);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.password) {
      dto.password = await hash(dto.password);
    }

    await this.userRepository.update(user.id, dto);
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(user.id);

    return { message: 'User deleted successfully' };
  }
}
