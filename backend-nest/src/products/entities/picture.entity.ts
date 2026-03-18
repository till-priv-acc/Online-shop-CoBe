import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('pictures')
export class Picture {
  @PrimaryGeneratedColumn('uuid')
  id?: string; // Primärschlüssel

  @Column()
  fileName?: string;

  // Verbindung zum Product
  @ManyToOne(() => Product, (product) => product.pictures, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;
}