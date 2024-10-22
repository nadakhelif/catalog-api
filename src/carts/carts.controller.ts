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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@Request() req) {
    return this.cartsService.getCart(req.user.userId);
  }

  @Patch('item/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
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
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item ID' })
  removeCartItem(@Request() req, @Param('id') id: string) {
    return this.cartsService.removeCartItem(req.user.userId, +id);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@Request() req) {
    return this.cartsService.clearCart(req.user.userId);
  }

  @Get('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get user cart (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID whose cart to retrieve' })
  @Roles('ADMIN')
  getCartAsAdmin(@Param('userId') userId: string) {
    return this.cartsService.getCart(+userId);
  }
}
