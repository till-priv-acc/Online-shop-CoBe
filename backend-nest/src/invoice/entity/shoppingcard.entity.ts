import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from './invoice.entity';

@Entity('shoppingcard')
export class ShoppingCard {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @ManyToOne(() => Product, (product) => product.shoppingCard, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product' })
  product?: Product;

  @ManyToOne(() => Invoice, (invoice) => invoice.shoppingcard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice' })
  invoice?: Invoice;

  @Column()
  number?: number;

}