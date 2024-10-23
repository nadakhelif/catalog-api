/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { setupTestData } from '../../test/testdata';
import { AppModule } from '../app.module';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartsService Integration Tests', () => {
  let app: INestApplication;
  let cartsService: CartsService;
  let prismaService: PrismaService;
  let testData: any;

  beforeAll(async () => {
    testData = await setupTestData();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cartsService = moduleFixture.get<CartsService>(CartsService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Reset product quantities before each test
    await prismaService.cartItem.deleteMany({});
    await prismaService.cart.deleteMany({});
    await prismaService.product.updateMany({
      data: { stockQuantity: 10 }, // Reset all products to have 10 items
    });
  });

  afterAll(async () => {
    await prismaService.cartItem.deleteMany({});
    await prismaService.cart.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.user.deleteMany({});
    await app.close();
  });

  describe('addToCart', () => {
    it('should add a new item to the cart and decrease product stock', async () => {
      const initialProduct = await prismaService.product.findUnique({
        where: { id: testData.products.product1.id },
      });

      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 2,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user1.id,
        addToCartDto,
      );

      // Verify cart item
      expect(cartItem).toBeDefined();
      expect(cartItem.productId).toBe(testData.products.product1.id);
      expect(cartItem.quantity).toBe(2);

      // Verify product stock was decreased
      const updatedProduct = await prismaService.product.findUnique({
        where: { id: testData.products.product1.id },
      });
      expect(updatedProduct.stockQuantity).toBe(
        initialProduct.stockQuantity - 2,
      );
    });

    it('should fail when trying to add more items than available stock', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 15, // More than the default 10 stock
      };

      await expect(
        cartsService.addToCart(testData.users.user1.id, addToCartDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update quantity if item exists and sufficient stock available', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product2.id,
        quantity: 3,
      };

      await cartsService.addToCart(testData.users.user2.id, addToCartDto);

      const secondAddToCartDto: AddToCartDto = {
        productId: testData.products.product2.id,
        quantity: 2,
      };

      const updatedCartItem = await cartsService.addToCart(
        testData.users.user2.id,
        secondAddToCartDto,
      );

      expect(updatedCartItem).toBeDefined();
      expect(updatedCartItem.quantity).toBe(5);

      // Verify product stock was decreased properly
      const product = await prismaService.product.findUnique({
        where: { id: testData.products.product2.id },
      });
      expect(product.stockQuantity).toBe(5); // 10 - 5
    });
  });

  describe('updateCartItem', () => {
    it('should update quantity and adjust product stock accordingly', async () => {
      // First add item to cart
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 2,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user2.id,
        addToCartDto,
      );

      // Update quantity
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 4,
      };

      const updatedCartItem = await cartsService.updateCartItem(
        testData.users.user2.id,
        cartItem.id,
        updateCartItemDto,
      );

      expect(updatedCartItem.quantity).toBe(4);

      // Verify product stock was adjusted
      const product = await prismaService.product.findUnique({
        where: { id: testData.products.product1.id },
      });
      expect(product.stockQuantity).toBe(6); // 10 - 4
    });

    it('should fail when updating to quantity exceeding available stock', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 2,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user2.id,
        addToCartDto,
      );

      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 12, // More than available stock
      };

      await expect(
        cartsService.updateCartItem(
          testData.users.user2.id,
          cartItem.id,
          updateCartItemDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCartItem', () => {
    it('should remove item and return quantity to product stock', async () => {
      // First add item to cart
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product2.id,
        quantity: 3,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user1.id,
        addToCartDto,
      );

      // Get stock after adding to cart
      const stockAfterAdd = await prismaService.product.findUnique({
        where: { id: testData.products.product2.id },
      });

      // Remove item from cart
      await cartsService.removeCartItem(testData.users.user1.id, cartItem.id);

      // Verify product stock was restored
      const stockAfterRemove = await prismaService.product.findUnique({
        where: { id: testData.products.product2.id },
      });
      expect(stockAfterRemove.stockQuantity).toBe(
        stockAfterAdd.stockQuantity + 3,
      );

      // Verify item was removed from cart
      const cart = await cartsService.getCart(testData.users.user1.id);
      expect(cart.items.some((item) => item.id === cartItem.id)).toBeFalsy();
    });
  });

  describe('clearCart', () => {
    it('should clear cart and return all quantities to product stock', async () => {
      // Add multiple items to cart
      await cartsService.addToCart(testData.users.user2.id, {
        productId: testData.products.product1.id,
        quantity: 3,
      });
      await cartsService.addToCart(testData.users.user2.id, {
        productId: testData.products.product2.id,
        quantity: 2,
      });

      // Clear cart
      const result = await cartsService.clearCart(testData.users.user2.id);
      expect(result.message).toBe('Cart cleared successfully');

      // Verify all product stocks were restored
      const product1 = await prismaService.product.findUnique({
        where: { id: testData.products.product1.id },
      });
      const product2 = await prismaService.product.findUnique({
        where: { id: testData.products.product2.id },
      });

      expect(product1.stockQuantity).toBe(10); // Stock restored to initial value
      expect(product2.stockQuantity).toBe(10); // Stock restored to initial value

      // Verify cart is empty
      const cart = await cartsService.getCart(testData.users.user2.id);
      expect(cart.items.length).toBe(0);
    });
  });
});
