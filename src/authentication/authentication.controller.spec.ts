/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      // admin user in db we test with that user
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
        UnauthorizedException,
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
      const result = await controller.signup(signUpDto);
      expect(result).toBeUndefined();
    });
  });
});
