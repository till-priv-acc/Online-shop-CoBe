import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductLogger } from '../logger/product-logger.service';
import { SellerGuard } from '../users/guards/seller.guard';
import { UsersModule } from '../users/users.module'; // importiere UsersModule, nicht UsersService direkt

@Module({
  imports: [UsersModule], // UsersService kommt automatisch aus dem UsersModule
  controllers: [ProductsController],
  providers: [ProductsService, ProductLogger, SellerGuard],
  exports: [ProductsService],
})
export class ProductsModule {}