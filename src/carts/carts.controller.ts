import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../guard/jwt-auth-guard';
import { RolesGuard } from '../guard/role.guard';
import { Roles } from '../authentication/roles.decorator';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(req.user.userId, addToCartDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCart(@Request() req) {
    return this.cartsService.getCart(req.user.userId);
  }

  @Patch('item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateCartItem(
      req.user.userId,
      +id,
      updateCartItemDto,
    );
  }

  @Delete('item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeCartItem(@Request() req, @Param('id') id: string) {
    return this.cartsService.removeCartItem(req.user.userId, +id);
  }

  @Delete('clear')
  clearCart(@Request() req) {
    return this.cartsService.clearCart(req.user.userId);
  }

  @Get('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getCartAsAdmin(@Param('userId') userId: string) {
    return this.cartsService.getCart(+userId);
  }
}
