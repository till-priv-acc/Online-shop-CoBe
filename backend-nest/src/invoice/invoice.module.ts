import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './entities/invoice.entity';
import { ShoppingCard } from './entities/shoppingcard.entity';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    // Registriert die Entities für TypeORM, damit Repositories automatisch verfügbar sind
    TypeOrmModule.forFeature([Invoice, ShoppingCard]),
  ],
  providers: [InvoiceService],
  exports: [InvoiceService], // Damit andere Module den Service nutzen können
})
export class InvoiceModule {}