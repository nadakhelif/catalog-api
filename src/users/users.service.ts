import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number, user: any) {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto, user: any) {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number, user: any) {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
