/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth-guard';

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    return user;
  }
}
