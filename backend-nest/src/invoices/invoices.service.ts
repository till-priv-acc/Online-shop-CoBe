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

    @InjectRepository(User)
    private readonly UserRepo: Repository<User>,

    private readonly logger: InvoiceLogger,
  ) {}

  // Invoice erstellen
async createInvoice(userId: string): Promise<Invoice> {
  this.logger.log(`[InvoicesService] Erstelle Invoice für User ${userId}`);

  let savedInvoice = await this.findOpenInvoice(userId);

  if (!savedInvoice) {
    const user = await this.UserRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      this.logger.error(`[InvoicesService] User mit der id ${userId} konnte nicht gefunden werden`);
      throw new Error("User konnte nicht gefunden werden");
    }

    const invoice = this.invoiceRepo.create({
      owner: user,
      ownerAddress: `${user.country}, ${user.pCode} ${user.town}, ${user.street} ${user.hNumber}`,
      isBought: false,
    });

    savedInvoice = await this.invoiceRepo.save(invoice);
    this.logger.log(`[InvoicesService] Invoice ${savedInvoice.id} erstellt`);
  } else {
    this.logger.log(`[InvoicesService] Es existiert bereits eine offene Invoice: ${savedInvoice.id}`);
  }

  return savedInvoice;
}

// Offene Invoice prüfen
async findOpenInvoice(userId: string): Promise<Invoice | undefined> {
  this.logger.log(`[InvoicesService] Überprüfe, ob offene Invoice für User ${userId} existiert`);

  const invoice = await this.invoiceRepo.findOne({
    where: {
      owner: { id: userId },
      isBought: false,
    },
    relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
  });

  if (invoice) {
    this.logger.log(`[InvoicesService] Offene Invoice für User ${userId} gefunden: ${invoice.id}`);
    return invoice;
  } else {
    this.logger.log(`[InvoicesService] Keine offene Invoice für User ${userId} gefunden`);
    return undefined;
  }
}

  // Alle Invoices holen
  async findAll(): Promise<Invoice[]> {
    this.logger.log(`[InvoicesService] Hole alle Invoices`);
    const invoices = await this.invoiceRepo.find({
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
    this.logger.log(`[InvoicesService] Gefundene Invoices: ${invoices.length}`);
    return invoices;
  }

  // Eine Invoice holen
  async findOne(id: string): Promise<Invoice | null> {
    this.logger.log(`[InvoicesService] Hole Invoice ${id}`);
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
    });
    if (invoice) {
      this.logger.log(`[InvoicesService] Invoice ${id} gefunden`);
    } else {
      this.logger.warn(`[InvoicesService] Invoice ${id} nicht gefunden`);
    }
    return invoice;
  }

  async findAllByUser(userId: string): Promise<Invoice[]> {
  this.logger.log(`[InvoicesService] Hole alle Invoices für User ${userId}`);

  const invoices = await this.invoiceRepo.find({
    where: { owner: { id: userId } },
    relations: ['shoppingcard', 'shoppingcard.product', 'owner'],
  });

  this.logger.log(`[InvoicesService] Gefundene Invoices für User ${userId}: ${invoices.length}`);
  return invoices;
}

  //Item hinzufügen
  async addItem(
  userId: string,
  productId: string,
  quantity: number,
): Promise<ShoppingCard> {
  this.logger.log(`[InvoicesService] Füge Produkt ${productId} (qty: ${quantity}) für User ${userId} hinzu`);

  // Stelle sicher, dass eine offene Invoice existiert
  const invoice = await this.createInvoice(userId);
  this.logger.log(`[InvoicesService] Offene Invoice ${invoice.id} für User ${userId} genutzt`);

  // Product laden inklusive createFrom (Seller)
  const product = await this.ProductRepo.findOne({
    where: { id: productId },
    relations: ['createFrom'], // createFrom = Seller
  });
  if (!product) {
    this.logger.error(`[InvoicesService] Produkt ${productId} nicht gefunden`);
    throw new Error('Product not found');
  }

  const seller = product.createFrom;
  if (!seller) {
    this.logger.error(`[InvoicesService] Seller für Produkt ${productId} nicht gefunden`);
    throw new Error('Seller not found');
  }

  // Seller-Adresse vom User übernehmen
  const sellerAddress = `${seller.country}, ${seller.pCode} ${seller.town}, ${seller.street} ${seller.hNumber}`;

  // ShoppingCard Item erstellen
  const item = this.shoppingCardRepo.create({
    invoice,
    product,
    seller,
    quantity,
    sellerAddress,
  });

  const savedItem = await this.shoppingCardRepo.save(item);
  this.logger.log(`[InvoicesService] Item ${savedItem.id} gespeichert für Invoice ${invoice.id}`);

  return savedItem;
}

async updateCartItemQuantity(
  invoiceId: string,
  productId: string,
  newQuantity: number,
): Promise<ShoppingCard> {
  this.logger.log(`[InvoicesService] Aktualisiere Warenkorb-Item: Invoice ${invoiceId}, Produkt ${productId} auf Quantity ${newQuantity}`);

  // Item in ShoppingCard suchen, wo Invoice und Product übereinstimmen
  const item = await this.shoppingCardRepo.findOne({
    where: {
      invoice: { id: invoiceId },
      product: { id: productId },
    },
    relations: ['product', 'seller', 'invoice'],
  });

  if (!item) {
    this.logger.error(`[InvoicesService] Kein Item gefunden für Invoice ${invoiceId} und Produkt ${productId}`);
    throw new Error('Cart item not found');
  }

  this.logger.log(`[InvoicesService] Vorherige Quantity: ${item.quantity}`);
  item.quantity = newQuantity;

  const savedItem = await this.shoppingCardRepo.save(item);
  this.logger.log(`[InvoicesService] Neue Quantity gespeichert: ${savedItem.quantity} für Item ${savedItem.id}`);

  return savedItem;
}

async deleteCartItem(
  invoiceId: string,
  productId: string,
): Promise<void> {
  this.logger.log(`[InvoicesService] Lösche Warenkorb-Item: Invoice ${invoiceId}, Produkt ${productId}`);

  // Item in ShoppingCard suchen
  const item = await this.shoppingCardRepo.findOne({
    where: {
      invoice: { id: invoiceId },
      product: { id: productId },
    },
    relations: ['product', 'seller', 'invoice'],
  });

  if (!item) {
    this.logger.warn(`[InvoicesService] Kein Item gefunden für Invoice ${invoiceId} und Produkt ${productId}, nichts zu löschen`);
    return;
  }

  await this.shoppingCardRepo.remove(item);
  this.logger.log(`[InvoicesService] Item ${item.id} erfolgreich gelöscht`);
}
  // Invoice als gekauft markieren und Lagerbestand abziehen
  async markAsBought(invoiceId: string): Promise<Invoice> {
    this.logger.log(`[InvoicesService] Markiere Invoice ${invoiceId} als gekauft`);

    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard', 'shoppingcard.product'],
    });

    if (!invoice) {
      this.logger.error(`[InvoicesService] Invoice ${invoiceId} nicht gefunden`);
      throw new Error('Invoice not found');
    }

    this.logger.log(`[InvoicesService] Aktualisiere Lagerbestand für ${invoice.shoppingcard?.length ?? 0} Produkte`);
    for (const item of invoice.shoppingcard ?? []) {
      if (item.product) {
        this.logger.log(`[InvoicesService] Produkt ${item.product.id} crowd: ${item.product.crowd} - Ziehe ${item.quantity} ab`);
        item.product.crowd -= item.quantity;
        await this.ProductRepo.save(item.product);
        this.logger.log(`[InvoicesService] Neuer crowd-Wert für Produkt ${item.product.id}: ${item.product.crowd}`);
      }
    }

    invoice.isBought = true;
    invoice.purchasedAt = new Date();
    const savedInvoice = await this.invoiceRepo.save(invoice);

    this.logger.log(`[InvoicesService] Invoice ${invoiceId} als gekauft markiert`);
    return savedInvoice;
  }

  // Gesamtpreis berechnen
  async calculateTotal(invoiceId: string): Promise<number> {
    this.logger.log(`[InvoicesService] Berechne Gesamtpreis für Invoice ${invoiceId}`);
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
      relations: ['shoppingcard', 'shoppingcard.product'],
    });

    if (!invoice) {
      this.logger.error(`[InvoicesService] Invoice ${invoiceId} nicht gefunden`);
      throw new Error('Invoice not found');
    }

    const total = (invoice.shoppingcard ?? []).reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      const qty = item.quantity ?? 0;
      this.logger.log(`[InvoicesService] Produkt ${item.product?.id} * qty ${qty} = ${price * qty}`);
      return sum + price * qty;
    }, 0);

    invoice.totalPrice = total;
    await this.invoiceRepo.save(invoice);
    this.logger.log(`[InvoicesService] Gesamtpreis für Invoice ${invoiceId}: ${total}`);

    return total;
  }
}