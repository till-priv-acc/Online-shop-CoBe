import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Beispiel: die Tabelle, auf die createFrom verweist
import { ShoppingCard } from './shoppingcard.entity';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @ManyToOne(() => User, (user) => user.invoice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner' })
  owner?: User;

  @Column()
  ownerAdress?: string;

  @ManyToOne(() => User, (user) => user.invoice, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner' })
  seller?: User;

  @Column()
  sellerAdress?: string;

  @Column()
  totalPrice?: number;

  @Column({ default: true })
  isBought?: boolean;

  @Column({ type: 'timestamp', nullable: true })
purchasedAt?: Date;

  // inverse relation
    @OneToMany(() => ShoppingCard, (shoppingcard) => shoppingcard.invoice)
    shoppingcard?: ShoppingCard[];

}