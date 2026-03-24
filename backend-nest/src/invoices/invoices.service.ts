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

    @InjectRepository(Product)
    private readonly ProductRepo: Repository<Product>,

    private readonly logger: InvoiceLogger,
  ) {}

  // Invoice erstellen
  async createInvoice(owner: User, ownerAddress: string): Promise<Invoice> {
    this.logger.log(`[InvoicesService] Erstelle Invoice für User ${owner.id} mit Adresse ${ownerAddress}`);
    const invoice = this.invoiceRepo.create({
      owner,
      ownerAddress,
      isBought: false,
    });

    const savedInvoice = await this.invoiceRepo.save(invoice);
    this.logger.log(`Invoice ${savedInvoice.id} erstellt`);
    return savedInvoice;
  }

  async findOpenInvoice(userId: string): Promise<boolean> {
  this.logger.log(`Überprüfe, ob offene Invoice für User ${userId} existiert`);

  const invoice = await this.invoiceRepo.findOne({
    where: {
      owner: { id: userId }, // Filter auf owner.id
      isBought: false,       // nur offene Rechnungen
    },
    relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
  });

  const exists = !!invoice;
  if (exists) {
    this.logger.log(`Offene Invoice für User ${userId} gefunden: ${invoice.id}`);
  } else {
    this.logger.log(`Keine offene Invoice für User ${userId} gefunden`);
  }

  return exists;
}

  // Alle Invoices holen
  async findAll(): Promise<Invoice[]> {
    this.logger.log(`Hole alle Invoices`);
    const invoices = await this.invoiceRepo.find({
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
    this.logger.log(`Gefundene Invoices: ${invoices.length}`);
    return invoices;
  }

  // Eine Invoice holen
  async findOne(id: string): Promise<Invoice | null> {
    this.logger.log(`Hole Invoice ${id}`);
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
    if (invoice) {
      this.logger.log(`Invoice ${id} gefunden`);
    } else {
      this.logger.warn(`Invoice ${id} nicht gefunden`);
    }
    return invoice;
  }

  // Item zur Invoice hinzufügen
  async addItem(
    invoiceId: string,
    product: Product,
    seller: User,
    quantity: number,
    sellerAddress: string,
  ): Promise<ShoppingCard> {
    this.logger.log(`Füge Produkt ${product.id} (qty: ${quantity}) zur Invoice ${invoiceId} hinzu`);

    const invoice = await this.invoiceRepo.findOneBy({ id: invoiceId });
    if (!invoice) {
      this.logger.error(`Invoice ${invoiceId} nicht gefunden`);
      throw new Error('Invoice not found');
    }

    const item = this.shoppingCardRepo.create({
      invoice,
      product,
      seller,
      quantity,
      sellerAddress,
    });

    const savedItem = await this.shoppingCardRepo.save(item);
    this.logger.log(`Item ${savedItem.id} gespeichert für Invoice ${invoiceId}`);
    return savedItem;
  }

  // Invoice als gekauft markieren und Lagerbestand abziehen
  async markAsBought(invoiceId: string): Promise<Invoice> {
    this.logger.log(`Markiere Invoice ${invoiceId} als gekauft`);

    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard', 'shoppingcard.product'],
    });

    if (!invoice) {
      this.logger.error(`Invoice ${invoiceId} nicht gefunden`);
      throw new Error('Invoice not found');
    }

    this.logger.log(`Aktualisiere Lagerbestand für ${invoice.shoppingcard?.length ?? 0} Produkte`);
    for (const item of invoice.shoppingcard ?? []) {
      if (item.product) {
        this.logger.log(`Produkt ${item.product.id} crowd: ${item.product.crowd} - Ziehe ${item.quantity} ab`);
        item.product.crowd -= item.quantity;
        await this.ProductRepo.save(item.product);
        this.logger.log(`Neuer crowd-Wert für Produkt ${item.product.id}: ${item.product.crowd}`);
      }
    }

    invoice.isBought = true;
    invoice.purchasedAt = new Date();
    const savedInvoice = await this.invoiceRepo.save(invoice);

    this.logger.log(`Invoice ${invoiceId} als gekauft markiert`);
    return savedInvoice;
  }

  // Gesamtpreis berechnen
  async calculateTotal(invoiceId: string): Promise<number> {
    this.logger.log(`Berechne Gesamtpreis für Invoice ${invoiceId}`);
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard', 'shoppingcard.product'],
    });

    if (!invoice) {
      this.logger.error(`Invoice ${invoiceId} nicht gefunden`);
      throw new Error('Invoice not found');
    }

    const total = (invoice.shoppingcard ?? []).reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      const qty = item.quantity ?? 0;
      this.logger.log(`Produkt ${item.product?.id} * qty ${qty} = ${price * qty}`);
      return sum + price * qty;
    }, 0);

    invoice.totalPrice = total;
    await this.invoiceRepo.save(invoice);
    this.logger.log(`Gesamtpreis für Invoice ${invoiceId}: ${total}`);

    return total;
  }
}