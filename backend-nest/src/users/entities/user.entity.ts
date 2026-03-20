import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Invoice } from '../../invoice/entity/invoice.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name?: string;

  @Column()
  firstname?: string;

  @Column()
  hNumber?: string;

  @Column()
  street?: string;

  @Column()
  town?: string;

  @Column()
  pCode?: string;

  @Column()
  country?: string;

  @Column()
  password?: string;

  @Column()
  email?: string;

  @Column({ default: "USER" })
  type?: string;

  // inverse relation
  @OneToMany(() => Product, (product) => product.createFrom)
  products?: Product[];

  @OneToMany(() => Invoice, (invoice) => invoice.owner)
  invoice?: Invoice[];
}