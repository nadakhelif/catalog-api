/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        UsersService,
        PrismaService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedToken'),
          },
        },
      ],
    }).compile();
    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany({});
    await service.signup({
      email: 'admin@example.com',
      password: 'adminPassword',
      role: 'ADMIN',
    });
    await service.signup({
      email: 'existing@example.com',
      password: 'password',
      role: Role.USER,
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation is successful', async () => {
      const result = await service.validateUser(
        'admin@example.com',
        'adminPassword',
      );
      const adminUser = await usersService.findByEmail('admin@example.com');
      expect(result).toEqual({
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt,
      });
    });

    it('should return null if user is not found', async () => {
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      // admin user in db we test with that user
      const result = await service.validateUser(
        'admin@example.com',
        'wrongPassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      // admin user in db we test with that user
      const adminUser = {
        email: 'admin@example.com',
        password: 'adminPassword',
        role: Role.ADMIN,
      };
      const result = await service.login(adminUser);
      expect(result).toEqual({ access_token: 'mockedToken' });
    });
  });

  describe('signup', () => {
    it('should throw ConflictException if user already exists', async () => {
      const signUpDto = {
        email: 'existing@example.com',
        password: 'newPassword',
        role: Role.USER,
      };
      await expect(service.signup(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
