import { Controller, Post, Get, InternalServerErrorException, BadRequestException, ForbiddenException, Body, UseGuards, Param, Req, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateCallDTO, AllProducts, ProductDBDTO, ProductUpdateDTO } from './dto/products.dto';
import { CurrentUserId } from '../users/decorators/current-user-id.decorater';
import { SellerGuard } from '../users/guards/seller.guard';
import { ProductLogger } from '../logger/product-logger.service';
import { AuthGuard } from '../users/guards/auth.guard';

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
  @UseGuards(AuthGuard)
  async getAllProducts(): Promise<AllProducts[]> {
    this.logger.log(`[ProductsController] GET /allProducts called`);
    try {
      const products = await this.productsService.getAllProducts();
      this.logger.log(`[ProductsController] Fetched ${products.length} products`);
      return products;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[ProductsController] Error fetching all products: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Get('product/:id')
  @UseGuards(AuthGuard)
  async getProduct(
    @Param('id') id: string,
  ): Promise<ProductDBDTO> {
    this.logger.log(`[ProductsController] GET /product/${id} called`);
    try {
      const product = await this.productsService.getProductDetail(id);
      this.logger.log(`[ProductsController] Fetched product ${id} successfully`);
      return product;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[ProductsController] Error fetching product ${id}: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  // --------------------
// Update UserData
// --------------------
@Patch('updateProductData')
@UseGuards(SellerGuard)
async updateProductData(
  @CurrentUserId() userId: string,
  @Body() body: ProductUpdateDTO,
) {

  if (!userId) {
    this.logger.warn('[ProductsController] updateUserData: decorator has no userId found');
    throw new InternalServerErrorException('Problem with the userId');
  }

  if(userId != body.createFrom) {
    this.logger.warn('[ProductsController] updateUserData: current Userid is not the Seller from the Product');
    throw new ForbiddenException('Seller has no rights to update');
  }

  const success = await this.productsService.updateProduct(
    body
  );

  if (!success) {
    this.logger.warn(
      `[ProductsController] updateProductData: Problem by updating Data from Product ${body.id}`
    );
    throw new BadRequestException('Problem with updating');
  }

  this.logger.log(
    `[ProductsController] updateProductData: ProductData updated for userId ${body.id}`
  );

  return { message: 'ProductData updated successfully' };
}

}