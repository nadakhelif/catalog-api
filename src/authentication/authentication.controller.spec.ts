/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
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

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany({});
    await authService.signup({
      email: 'admin@example.com',
      password: 'adminPassword',
      role: 'ADMIN',
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'adminPassword',
      };
      const result = await controller.login(loginDto);
      expect(result).toEqual({ access_token: 'mockedToken' });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      await expect(controller.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('signup', () => {
    it('should call authService.signup with the provided DTO', async () => {
      const signUpDto = {
        email: 'new4@example.com',
        password: 'password',
        role: Role.USER,
      };

      jest.spyOn(authService, 'signup').mockResolvedValue({
        id: 1,
        email: signUpDto.email,
        role: signUpDto.role,
      });

      const result = await controller.signup(signUpDto);
      expect(result).toEqual({
        id: 1,
        email: signUpDto.email,
        role: signUpDto.role,
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      const signUpDto = {
        email: 'existing@example.com',
        password: 'password',
        role: Role.USER,
      };

      jest
        .spyOn(authService, 'signup')
        .mockRejectedValue(new ConflictException('User already exists'));

      await expect(controller.signup(signUpDto)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
    });
  });
});
