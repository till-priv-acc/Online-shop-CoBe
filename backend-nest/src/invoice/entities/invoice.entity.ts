import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Beispiel: die Tabelle, auf die createFrom verweist
import { ShoppingCard } from './shoppingcard.entity';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'owner' })
  owner?: User;

  @Column({nullable: false})
  ownerAddress?: string;

  @Column({nullable: true})
  totalPrice?: number;

  @Column({ default: false })
  isBought?: boolean;

  @Column({ type: 'datetime', nullable: true })
  purchasedAt?: Date | null;

  // inverse relation
    @OneToMany(() => ShoppingCard, (shoppingcard) => shoppingcard.invoice)
    shoppingcard?: ShoppingCard[];

}