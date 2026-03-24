import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceLogger } from '../logger/invoice-logger.service';

import { Invoice } from './entities/invoice.entity';
import { ShoppingCard } from './entities/shoppingcard.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(ShoppingCard)
    private readonly shoppingCardRepo: Repository<ShoppingCard>,
  ) {}

  // ✅ Invoice erstellen
  async createInvoice(owner: User, ownerAddress: string): Promise<Invoice> {
    const invoice = this.invoiceRepo.create({
      owner,
      ownerAddress,
      isBought: false,
    });

    return await this.invoiceRepo.save(invoice);
  }

  // ✅ Alle Invoices holen
  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
  }

  // ✅ Eine Invoice holen
  async findOne(id: string): Promise<Invoice | null> {
    return this.invoiceRepo.findOne({
      where: { id },
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
  }

  // ✅ Item zur Invoice hinzufügen
  async addItem(
    invoiceId: string,
    product: Product,
    seller: User,
    quantity: number,
    sellerAddress: string,
  ): Promise<ShoppingCard> {
    const invoice = await this.invoiceRepo.findOneBy({ id: invoiceId });
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const item = this.shoppingCardRepo.create({
      invoice,
      product,
      seller,
      quantity,
      sellerAddress,
    });

    return await this.shoppingCardRepo.save(item);
  }

  // ✅ Invoice als gekauft markieren
  async markAsBought(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard'],
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.isBought = true;
    invoice.purchasedAt = new Date();

    return await this.invoiceRepo.save(invoice);
  }

  // ✅ Gesamtpreis berechnen (wichtig: NICHT speichern erzwingen)
  async calculateTotal(invoiceId: string): Promise<number> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard', 'shoppingcard.product'],
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const total = (invoice.shoppingcard ?? []).reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * (item.quantity ?? 0);
    }, 0);

    // optional speichern
    invoice.totalPrice = total;
    await this.invoiceRepo.save(invoice);

    return total;
  }

  // ✅ Invoice löschen
  async deleteInvoice(id: string): Promise<void> {
    await this.invoiceRepo.delete(id);
  }
}