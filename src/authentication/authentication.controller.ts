import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }
  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    await this.authService.signup(signUpDto);
  }
}
