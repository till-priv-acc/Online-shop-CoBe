import { v4 as uuidv4 } from 'uuid';

export class ProductEntity {
  id!: string;                  // UUID
  name!: string;                // Produktname
  description!: string;
  crowd!: number;
  minCrowd!: number;
  price!: number;
  deliverable!: number;         // Lieferzeit in Tagen
  deliverableAbroad!: number;   // Lieferzeit ins Ausland
  material!: string;
  color!: string;
  category!: string;
  isAvailible!: boolean;
  createFrom!: string;          // User-ID (Fremdschlüssel)

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
    this.id = this.id ?? uuidv4();          // UUID generieren, falls nicht vorhanden
    this.isAvailible = this.isAvailible ?? true;  // default verfügbar
  }
}

export class PictureEntity {
  id!: string;                  // UUID
  fileName!: string;         // User-ID (Fremdschlüssel)

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
    this.id = this.id ?? uuidv4();          // UUID generieren, falls nicht vorhanden
  }
}

export interface PictureCallDto {
  fileName?: string;
}

export interface PictureDBDto {
  fileName: string;
  id: string;
}

// DTO für Create User Request
export class CreateCallDTO {             // UUID
  name!: string;                // Produktname
  description!: string;
  crowd!: number;
  minCrowd!: number;
  price!: number;
  deliverable!: number;         // Lieferzeit in Tagen
  deliverableAbroad!: number;   // Lieferzeit ins Ausland
  material!: string;
  color!: string;
  category!: string;
  pictures?: PictureCallDto[]; // optional

  constructor(partial: Partial<CreateCallDTO>) {
    Object.assign(this, partial);
  }
}

// DTO für Produkt Request
export class ProductUpdateDTO {
  id!: string;                  // UUID
  name!: string;                // Produktname
  description!: string;
  crowd!: number;
  minCrowd!: number;
  price!: number;
  deliverable!: number;         // Lieferzeit in Tagen
  deliverableAbroad!: number;   // Lieferzeit ins Ausland
  material!: string;
  color!: string;
  category!: string;
  isAvailible!: boolean;
  createFrom!: string;
  pictures?: PictureCallDto[]; // optional

  constructor(partial: Partial<ProductDBDTO>) {
    Object.assign(this, partial);
  }
}

// DTO für Produkt Request
export class ProductDBDTO {
  id!: string;                  // UUID
  name!: string;                // Produktname
  description!: string;
  crowd!: number;
  minCrowd!: number;
  price!: number;
  deliverable!: number;         // Lieferzeit in Tagen
  deliverableAbroad!: number;   // Lieferzeit ins Ausland
  material!: string;
  color!: string;
  category!: string;
  isAvailible!: boolean;
  createFrom!: string;          // User Name
  createFromID!: string;         // UUID User
  createFromAdress!: string;
  pictures?: PictureCallDto[]; // optional

  constructor(partial: Partial<ProductDBDTO>) {
    Object.assign(this, partial);
  }
}

// DTO für All Products
export class AllProducts {
  id!: string;                  // UUID
  name!: string;                // Produktname
  price!: number;
  category!: string;
  isAvailible!: boolean;
  createFrom!: string;          // User Name
  createFromid!: string;        // User-ID 
  pictures?: string; // optional

  constructor(partial: Partial<AllProducts>) {
    Object.assign(this, partial);
  }
}