import {
  Controller,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guard/jwt-auth-guard';
import { RolesGuard } from '../guard/role.guard';
import { Roles } from '../authentication/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.usersService.findOne(+id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    const user = req.user;
    return this.usersService.update(+id, updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    return this.usersService.remove(+id, user);
  }
}
