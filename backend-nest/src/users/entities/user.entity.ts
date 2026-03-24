import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { ShoppingCard } from '../../invoice/entities/shoppingcard.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  firstname!: string;

  @Column({ nullable: true })
  hNumber?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  town?: string;

  @Column({ nullable: true })
  pCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ nullable: false, unique: true })
  email!: string;

  @Column({ default: 'USER' })
  type!: string;

  // Inverse relation zu Produkten
  @OneToMany(() => Product, (product) => product.createFrom)
  products?: Product[];

  // Inverse relation zu ShoppingCard
  @OneToMany(() => ShoppingCard, (shoppingcard) => shoppingcard.seller)
  shoppingcard?: ShoppingCard[];

  // Inverse relation zu Rechnungen
  @OneToMany(() => Invoice, (invoice) => invoice.owner)
  invoices?: Invoice[];
}