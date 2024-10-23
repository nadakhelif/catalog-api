import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stockQuantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }

      let cart = await tx.cart.findFirst({ where: { userId } });

      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }

      const existingItem = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId },
      });

      const totalQuantity = (existingItem?.quantity || 0) + quantity;
      if (totalQuantity > product.stockQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: product.stockQuantity - quantity },
      });

      if (existingItem) {
        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        return tx.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        });
      }
    });
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
    return await this.prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true, product: true },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        throw new NotFoundException('Cart item not found');
      }

      const quantityDiff = updateCartItemDto.quantity - cartItem.quantity;

      if (quantityDiff > 0) {
        // Check if enough stock for increase
        if (cartItem.product.stockQuantity < quantityDiff) {
          throw new BadRequestException('Insufficient stock');
        }

        // Decrease product stock
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stockQuantity: cartItem.product.stockQuantity - quantityDiff,
          },
        });
      } else if (quantityDiff < 0) {
        // Return stock for decrease
        await tx.product.update({
          where: { id: cartItem.productId },
          data: {
            stockQuantity: cartItem.product.stockQuantity - quantityDiff,
          },
        });
      }

      return tx.cartItem.update({
        where: { id: itemId },
        data: updateCartItemDto,
      });
    });
  }

  async removeCartItem(userId: number, itemId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });

      if (!cartItem || cartItem.cart.userId !== userId) {
        throw new NotFoundException('Cart item not found');
      }

      await tx.product.update({
        where: { id: cartItem.productId },
        data: {
          stockQuantity: {
            increment: cartItem.quantity,
          },
        },
      });

      return tx.cartItem.delete({ where: { id: itemId } });
    });
  }

  async clearCart(userId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return { message: 'Cart cleared successfully' };
    });
  }
}
