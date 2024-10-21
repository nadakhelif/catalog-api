import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    let cart = await this.prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      return this.prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }
  }

  async getCart(userId: number) {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  }

  async updateCartItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: updateCartItemDto,
    });
  }

  async removeCartItem(userId: number, itemId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      throw new Error('Cart not found');
    }

    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });

    if (!cart) {
      throw new Error('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared successfully' };
  }
}
