import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from './invoice.entity';
import { User } from '../../users/entities/user.entity';

@Entity('shoppingcard')
export class ShoppingCard {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @ManyToOne(() => Product, (product) => product.shoppingCard, { onDelete: 'SET NULL', nullable: false })
  @JoinColumn({ name: 'product' })
  product?: Product;

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'SET NULL', nullable: false })
  @JoinColumn({ name: 'owner' })
  seller?: User;

  @Column({nullable: false})
  sellerAddress?: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.shoppingcard, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'invoice' })
  invoice?: Invoice;

  @Column({nullable: false})
  quantity?: number;

}