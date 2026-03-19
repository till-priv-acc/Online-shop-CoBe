export const productMaterials = ["Holz", "Metall", "Kunststoff", "Stoff", "Halbmetall"];
export const productColors = ["Rot", "Blau", "Grün", "Schwarz", "Weiß", "Beige", "Hellblau", "Braun", "Dunkelbraun", "Hellbraun", "Rosa", "Lila", "Hellgrün"];
export const prodouctCategories = ["Dekoration", "Möbel", "Spielzeug", "Küche", "Auto Zubehör", "Fashion", "Elektronik", "Haustier Zubehör", "Beauty und Gesundheit"];

export const productCategoryColors: Record<string, string> = {
  "Dekoration": "#FFB6C1",
  "Möbel": "#8B4513",
  "Spielzeug": "#FFD700",
  "Küche": "#FF6347",
  "Auto Zubehör": "#4682B4",
  "Fashion": "#DA70D6",
  "Elektronik": "#20B2AA",
  "Haustier Zubehör": "#90EE90",
  "Beauty und Gesundheit": "#FF69B4",
};

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
  createFrom!: string;          // User-ID (Fremdschlüssel)
  createFromID!: string;
  createFromAdress!: string;
  pictures?: PictureCallDto[]; // optional

  constructor(partial: Partial<ProductDBDTO>) {
    Object.assign(this, partial);
  }
}

interface PictureCallDto {
  fileName: string;
}

export interface AllProducts {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailible: boolean;
  createFrom: string;
  pictures?: string;
}