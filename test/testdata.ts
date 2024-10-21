import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AuthenticationService } from '../src/authentication/authentication.service';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from '../src/products/dto/create-product.dto';
import { Role } from '@prisma/client';

export async function setupTestData() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  await app.init();

  const authService = moduleFixture.get<AuthenticationService>(
    AuthenticationService,
  );
  const productsService = moduleFixture.get<ProductsService>(ProductsService);
  const prismaService = moduleFixture.get<PrismaService>(PrismaService);

  // Clear existing data
  await prismaService.cartItem.deleteMany({});
  await prismaService.cart.deleteMany({});
  await prismaService.product.deleteMany({});
  await prismaService.user.deleteMany({});

  // Create users using AuthService signup
  const user1 = await authService.signup({
    email: 'user1@example.com',
    password: 'password123',
    role: Role.USER,
  });
  const user2 = await authService.signup({
    email: 'user2@example.com',
    password: 'password123',
    role: Role.USER,
  });
  const adminUser = await authService.signup({
    email: 'admin@example.com',
    password: 'adminpass123',
    role: 'ADMIN',
  });

  // Create products
  const product1: CreateProductDto = {
    name: 'Product 1',
    description: 'Description 1',
    price: 10,
    isConnectedOnly: false,
  };
  const product2: CreateProductDto = {
    name: 'Product 2',
    description: 'Description 2',
    price: 20,
    isConnectedOnly: false,
  };
  const product3: CreateProductDto = {
    name: 'Product 3',
    description: 'Description 3',
    price: 30,
    isConnectedOnly: true,
  };

  const createdProduct1 = await productsService.create(product1);
  const createdProduct2 = await productsService.create(product2);
  const createdProduct3 = await productsService.create(product3);

  await app.close();

  return {
    users: { user1, user2, adminUser },
    products: {
      product1: createdProduct1,
      product2: createdProduct2,
      product3: createdProduct3,
    },
  };
}
