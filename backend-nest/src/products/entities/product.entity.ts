import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Picture } from './picture.entity';
import { ShoppingCard } from '../../invoices/entities/shoppingcard.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Primärschlüssel, Pflichtfeld für TypeORM

  @Column({ nullable: false })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: false })
  crowd!: number;

  @Column({ nullable: false })
  minCrowd!: number;

  @Column('decimal', { nullable: false })
  price!: number;

  @Column({ nullable: false })
  deliverable!: number;

  @Column({ nullable: false })
  deliverableAbroad!: number;

  @Column({ nullable: true })
  material?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ default: true })
  isAvailible!: boolean;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'createFrom' })
  createFrom!: User; // User direkt, kein string

  @OneToMany(() => Picture, (picture) => picture.product, { cascade: true, eager: true })
  pictures?: Picture[];

  @OneToMany(() => ShoppingCard, (shoppingcard) => shoppingcard.product)
  shoppingCard?: ShoppingCard[];
}