import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './entities/invoice.entity';
import { ShoppingCard } from './entities/shoppingcard.entity';
import { InvoiceService } from './invoices.service';
import { Product } from '../products/entities/product.entity';
import { InvoiceLogger } from '../logger/invoice-logger.service';

@Module({
  imports: [
    // Registriert die Entities für TypeORM, damit Repositories automatisch verfügbar sind
    TypeOrmModule.forFeature([Invoice, ShoppingCard, Product]),
  ],
  providers: [InvoiceService, InvoiceLogger],
  exports: [InvoiceService], // Damit andere Module den Service nutzen können
})
export class InvoiceModule {}