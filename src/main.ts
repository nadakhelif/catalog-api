import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const catalogApiConfig = new DocumentBuilder()
    .setTitle('Catalog API')
    .setDescription('API for managing product catalogs')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('catalog')
    .build();
  const document = SwaggerModule.createDocument(app, catalogApiConfig);
  SwaggerModule.setup('api/docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
