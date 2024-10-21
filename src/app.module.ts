import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [AuthenticationModule, UsersModule, ProductsModule, CartsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
