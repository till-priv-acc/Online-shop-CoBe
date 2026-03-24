import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Picture } from './entities/picture.entity';
import { User } from '../users/entities/user.entity';
import { ProductLogger } from '../logger/product-logger.service';
import { ProductEntity, PictureEntity, CreateCallDTO, PictureCallDto, AllProducts, ProductDBDTO, ProductUpdateDTO } from './dto/products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly logger: ProductLogger,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Picture) private readonly pictureRepo: Repository<Picture>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async createProduct(createDto: CreateCallDTO, userId: string): Promise<Product> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const product = this.productRepo.create({
      ...createDto,
      createFrom: user,
      isAvailible: true,
    });

    if (createDto.pictures && createDto.pictures.length > 0) {
      product.pictures = createDto.pictures.map(pic =>
        this.pictureRepo.create({ fileName: pic.fileName })
      );
    }

    const savedProduct = await this.productRepo.save(product);
    this.logger.log(`[ProductsService] Product saved: ${savedProduct.name} (ID: ${savedProduct.id})`);
    if (savedProduct.pictures) {
      savedProduct.pictures.forEach(pic => this.logger.log(`[ProductsService] Picture saved: ${pic.fileName}`));
    }
    return savedProduct;
  }

  async getAllProducts(): Promise<AllProducts[]> {
    const products = await this.productRepo.find({ relations: ['pictures', 'createFrom'] });
    return products.map(p => {
      const pictureFile = p.pictures && p.pictures.length > 0 ? p.pictures[0].fileName : undefined;
      const createFromName = p.createFrom ? `${p.createFrom.name} ${p.createFrom.firstname}` : 'Unknown';
      return new AllProducts({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        isAvailible: !!p.isAvailible,
        createFrom: createFromName,
        createFromid: p.createFrom?.id,
        pictures: pictureFile,
      });
    });
  }

  async getProductDetail(productId: string): Promise<ProductDBDTO> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['pictures', 'createFrom'],
    });
    if (!product) throw new Error(`Product ${productId} not found`);

    const pictures = product.pictures?.map(p => ({ fileName: p.fileName }));
    const createFrom = product.createFrom;
    const createFromName = createFrom ? `${createFrom.name} ${createFrom.firstname}` : 'Unknown';
    const createFromAdress = createFrom ? `${createFrom.country}, ${createFrom.pCode} ${createFrom.town}, ${createFrom.street} ${createFrom.hNumber}` : '';

    return new ProductDBDTO({
      id: product.id,
      name: product.name,
      description: product.description,
      crowd: product.crowd,
      minCrowd: product.minCrowd,
      price: product.price,
      deliverable: product.deliverable,
      deliverableAbroad: product.deliverableAbroad,
      material: product.material,
      color: product.color,
      category: product.category,
      isAvailible: !!product.isAvailible,
      createFrom: createFromName,
      createFromID: createFrom?.id,
      createFromAdress: createFromAdress,
      pictures: pictures?.length ? pictures : undefined,
    });
  }

  async updateProduct(productUpdateDTO: ProductUpdateDTO): Promise<boolean> {
    let user: User | undefined;

    if (productUpdateDTO.createFrom) {
      const foundUser = await this.userRepo.findOneBy({ id: productUpdateDTO.createFrom });
      if (!foundUser) {
        this.logger.warn(`[ProductsService] User not found for createFrom: ${productUpdateDTO.createFrom}`);
        return false;
      }
      user = foundUser; // User | undefined, TS happy
    }

    const productData: Partial<Product> = {
      ...productUpdateDTO,
      createFrom: user, // korrekt getypt: User | undefined
    };

    const prod = await this.productRepo.preload({ id: productUpdateDTO.id, ...productData });
    if (!prod) return false;

    prod.isAvailible = prod.crowd > prod.minCrowd;

    await this.productRepo.save(prod);
    this.logger.log(`[ProductsService] Product updated: ${productUpdateDTO.id}`);
    return true;
  }

  async delete(productID: string): Promise<boolean> {
    const result = await this.productRepo.delete(productID);
    if (result.affected && result.affected > 0) {
      this.logger.log(`Product deleted: ${productID}`);
    } else {
      this.logger.warn(`Product not found: ${productID}`);
    }
    return !!result.affected;
  }
}