import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Beispiel: die Tabelle, auf die createFrom verweist
import { Picture } from './picture.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @Column()
  name?: string;

  @Column('text')
  description?: string;

  @Column()
  crowd?: number;

  @Column()
  minCrowd?: number;

  @Column('decimal')
  price?: number;

  @Column()
  deliverable?: number;

  @Column()
  deliverableAbroad?: number;

  @Column()
  material?: string;

  @Column()
  color?: string;

  @Column()
  category?: string;

  @Column({ default: true })
  isAvailible?: boolean;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createFrom' })
  createFrom?: User;

  @OneToMany(() => Picture, (picture) => picture.product)
  pictures?: Picture[];
}