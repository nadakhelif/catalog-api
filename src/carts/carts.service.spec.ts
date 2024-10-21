/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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

  afterAll(async () => {
    await prismaService.cartItem.deleteMany({});
    await prismaService.cart.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.user.deleteMany({});
    await app.close();
  });

  describe('addToCart', () => {
    it('should add a new item to the cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 2,
      };
      console.log(testData.users.user1);
      const cartItem = await cartsService.addToCart(
        testData.users.user1.id,
        addToCartDto,
      );

      expect(cartItem).toBeDefined();
      expect(cartItem.productId).toBe(testData.products.product1.id);
      expect(cartItem.quantity).toBe(2);
    });

    it('should update quantity if item already exists in cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product2.id,
        quantity: 1,
      };

      await cartsService.addToCart(testData.users.user2.id, addToCartDto);
      const updatedCartItem = await cartsService.addToCart(
        testData.users.user2.id,
        addToCartDto,
      );

      expect(updatedCartItem).toBeDefined();
      expect(updatedCartItem.productId).toBe(testData.products.product2.id);
      expect(updatedCartItem.quantity).toBe(2);
    });

    it('should add a connected-only product to the cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product3.id,
        quantity: 1,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user1.id,
        addToCartDto,
      );

      expect(cartItem).toBeDefined();
      expect(cartItem.productId).toBe(testData.products.product3.id);
      expect(cartItem.quantity).toBe(1);
    });
  });

  describe('getCart', () => {
    it("should return the user's cart with items", async () => {
      const cart = await cartsService.getCart(testData.users.user1.id);

      expect(cart).toBeDefined();
      expect(cart.userId).toBe(testData.users.user1.id);
      expect(cart.items).toBeDefined();
      expect(cart.items.length).toBeGreaterThan(0);
      expect(
        cart.items.some(
          (item) => item.productId === testData.products.product1.id,
        ),
      ).toBeTruthy();
      expect(
        cart.items.some(
          (item) => item.productId === testData.products.product3.id,
        ),
      ).toBeTruthy();
    });
  });

  describe('updateCartItem', () => {
    it('should update the quantity of a cart item', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product1.id,
        quantity: 1,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user2.id,
        addToCartDto,
      );

      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      const updatedCartItem = await cartsService.updateCartItem(
        testData.users.user2.id,
        cartItem.id,
        updateCartItemDto,
      );

      expect(updatedCartItem).toBeDefined();
      expect(updatedCartItem.id).toBe(cartItem.id);
      expect(updatedCartItem.quantity).toBe(3);
    });

    it('should throw an error when updating an item in a non-existent cart', async () => {
      await expect(
        cartsService.updateCartItem(999, 1, { quantity: 2 }),
      ).rejects.toThrow('Cart not found');
    });
  });

  describe('removeCartItem', () => {
    it('should remove an item from the cart', async () => {
      const addToCartDto: AddToCartDto = {
        productId: testData.products.product2.id,
        quantity: 1,
      };

      const cartItem = await cartsService.addToCart(
        testData.users.user1.id,
        addToCartDto,
      );

      const removedCartItem = await cartsService.removeCartItem(
        testData.users.user1.id,
        cartItem.id,
      );

      expect(removedCartItem).toBeDefined();
      expect(removedCartItem.id).toBe(cartItem.id);

      const cart = await cartsService.getCart(testData.users.user1.id);
      expect(cart.items.some((item) => item.id === cartItem.id)).toBeFalsy();
    });

    it('should throw an error when removing an item from a non-existent cart', async () => {
      await expect(cartsService.removeCartItem(999, 1)).rejects.toThrow(
        'Cart not found',
      );
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', async () => {
      await cartsService.addToCart(testData.users.user2.id, {
        productId: testData.products.product1.id,
        quantity: 1,
      });
      await cartsService.addToCart(testData.users.user2.id, {
        productId: testData.products.product2.id,
        quantity: 2,
      });

      const result = await cartsService.clearCart(testData.users.user2.id);

      expect(result).toBeDefined();
      expect(result.message).toBe('Cart cleared successfully');

      const cart = await cartsService.getCart(testData.users.user2.id);
      expect(cart.items.length).toBe(0);
    });

    it('should throw an error when clearing a non-existent cart', async () => {
      await expect(cartsService.clearCart(999)).rejects.toThrow(
        'Cart not found',
      );
    });
  });
});
