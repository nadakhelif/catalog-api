import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: createProductDto });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(isConnected: boolean) {
    try {
      return await this.prisma.product.findMany({
        where: isConnected ? {} : { isConnectedOnly: false },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: number, isConnected: boolean) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      if (product.isConnectedOnly && !isConnected) {
        throw new ForbiddenException(
          'This product is only accessible to authenticated users',
        );
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching the product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id, true);
      return await this.prisma.product.update({
        where: { id: product.id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update the product');
    }
  }

  async remove(id: number) {
    try {
      const product = await this.findOne(id, true);
      return await this.prisma.product.delete({ where: { id: product.id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete the product');
    }
  }

  async updateStock(id: number, quantityChange: number) {
    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const newQuantity = product.stockQuantity + quantityChange;

      if (newQuantity < 0) {
        throw new BadRequestException('Insufficient stock');
      }

      return await tx.product.update({
        where: { id },
        data: { stockQuantity: newQuantity },
      });
    });
  }
}
