import { Controller, Post, Get, InternalServerErrorException, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateCallDTO, AllProducts } from './dto/products.dto';
import { CurrentUserId } from '../users/decorators/current-user-id.decorater';
import { SellerGuard } from '../users/guards/seller.guard';
import { ProductLogger } from '../logger/product-logger.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly logger: ProductLogger
  ) {}

  @Post('createproduct')
  @UseGuards(SellerGuard)
  async createProduct(
    @Body() createDto: CreateCallDTO,
    @CurrentUserId() userId: string
  ) {
    this.logger.log(`[ProductsController] Create product request by userId: ${userId}`);
    const product = await this.productsService.createProduct(createDto, userId);
    this.logger.log(`[ProductsController] Product created: ${product.name} (ID: ${product.id})`);
    return product;
  }

    @Get('allProducts')
  async getAllProducts(): Promise<AllProducts[]> {
    try {
      const products = await this.productsService.getAllProducts();
      return products;
    } catch (err: unknown) {
      // Type-Safe Zugriff auf err.message
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[ProductsController] Error fetching products: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }
}