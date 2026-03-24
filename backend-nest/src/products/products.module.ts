import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductLogger } from '../logger/product-logger.service';
import { SellerGuard } from '../users/guards/seller.guard';
import { UsersModule } from '../users/users.module';
import { Product } from './entities/product.entity';
import { Picture } from './entities/picture.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Picture, User]), // Repositories bereitstellen
    UsersModule, // UsersService weiterhin verfügbar
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductLogger, SellerGuard],
  exports: [ProductsService],
})
export class ProductsModule {}