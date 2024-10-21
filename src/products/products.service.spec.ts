import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { INestApplication } from '@nestjs/common';

describe('ProductsService Integration Tests', () => {
  let app: INestApplication;
  let productsService: ProductsService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productsService = moduleFixture.get<ProductsService>(ProductsService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean all products before testing
    await prismaService.product.deleteMany({});
    // Create test products
    await prismaService.product.createMany({
      data: [
        {
          name: 'Public Product 1',
          description: 'Description 1',
          price: 10,
          isConnectedOnly: false,
        },
        {
          name: 'Public Product 2',
          description: 'Description 2',
          price: 20,
          isConnectedOnly: false,
        },
        {
          name: 'Connected Product 1',
          description: 'Description 3',
          price: 30,
          isConnectedOnly: true,
        },
        {
          name: 'Connected Product 2',
          description: 'Description 4',
          price: 40,
          isConnectedOnly: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 19.99,
        isConnectedOnly: false,
      };

      const createdProduct = await productsService.create(createProductDto);

      expect(createdProduct).toBeDefined();
      expect(createdProduct.name).toBe(createProductDto.name);
      expect(createdProduct.description).toBe(createProductDto.description);
      expect(createdProduct.price).toBe(createProductDto.price);
      expect(createdProduct.isConnectedOnly).toBe(
        createProductDto.isConnectedOnly,
      );
    });
  });

  describe('findAll', () => {
    it('should return all products when connected', async () => {
      const products = await productsService.findAll(true);
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(5);
      expect(products.some((product) => product.isConnectedOnly)).toBe(true);
    });

    it('should return only non-connected products when not connected', async () => {
      const products = await productsService.findAll(false);
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(3);
      expect(products.every((product) => !product.isConnectedOnly)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product5',
        description: 'This is a test product for findOne',
        price: 29.99,
        isConnectedOnly: false,
      };

      const createdProduct = await productsService.create(createProductDto);
      const foundProduct = await productsService.findOne(createdProduct.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct.id).toBe(createdProduct.id);
      expect(foundProduct.name).toBe(createdProduct.name);
    });

    it('should throw NotFoundException for non-existent product', async () => {
      await expect(productsService.findOne(999999)).rejects.toThrow(
        'Product with ID 999999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product6',
        description: 'This product will be updated',
        price: 39.99,
        isConnectedOnly: false,
      };

      const createdProduct = await productsService.create(createProductDto);

      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product Name',
        price: 49.99,
      };

      const updatedProduct = await productsService.update(
        createdProduct.id,
        updateProductDto,
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.id).toBe(createdProduct.id);
      expect(updatedProduct.name).toBe(updateProductDto.name);
      expect(updatedProduct.price).toBe(updateProductDto.price);
      expect(updatedProduct.description).toBe(createdProduct.description);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Non-existent Product',
      };

      await expect(
        productsService.update(999999, updateProductDto),
      ).rejects.toThrow('Product with ID 999999 not found');
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product to Remove',
        description: 'This product will be removed',
        price: 59.99,
        isConnectedOnly: false,
      };

      const createdProduct = await productsService.create(createProductDto);
      const removedProduct = await productsService.remove(createdProduct.id);

      expect(removedProduct).toBeDefined();
      expect(removedProduct.id).toBe(createdProduct.id);

      await expect(productsService.findOne(createdProduct.id)).rejects.toThrow(
        `Product with ID ${createdProduct.id} not found`,
      );
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      await expect(productsService.remove(999999)).rejects.toThrow(
        'Product with ID 999999 not found',
      );
    });
  });
});
