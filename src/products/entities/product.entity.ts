import { CartItem } from '@prisma/client';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class Product {
  id: number;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  isConnectedOnly: boolean;

  createdAt: Date;
  updatedAt: Date;

  cartItems?: CartItem[];
}
