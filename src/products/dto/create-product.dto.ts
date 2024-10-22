import { IsString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Premium Headphones',
    description: 'The name of the product',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'High-quality wireless headphones with noise cancellation',
    description: 'Detailed description of the product',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 299.99,
    description: 'The price of the product',
    minimum: 0,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: true,
    description: 'Whether the product is only available to connected users',
  })
  @IsBoolean()
  isConnectedOnly: boolean;
}
