/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private excludePassword(user: any): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      return this.excludePassword(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.prisma.user.findMany();
      return users.map((user) => this.excludePassword(user));
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findOne(id: number, user: any): Promise<UserResponseDto> {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    try {
      const foundUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!foundUser) {
        throw new NotFoundException('User not found');
      }

      return this.excludePassword(foundUser);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    user: any,
  ): Promise<UserResponseDto> {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return this.excludePassword(updatedUser);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: number, user: any): Promise<UserResponseDto> {
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      return this.excludePassword(deletedUser);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: any) {
    if (
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
    }
    throw new InternalServerErrorException('Something went wrong');
  }
}
