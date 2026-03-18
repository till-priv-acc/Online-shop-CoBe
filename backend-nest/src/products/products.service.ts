import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import { ProductEntity, PictureEntity, CreateCallDTO, PictureCallDto, AllProducts, ProductDBDTO, ProductUpdateDTO } from './dto/products.dto';
import { ProductLogger } from '../logger/product-logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  private db: sqlite3.Database;

  constructor(private readonly logger: ProductLogger) {
    this.db = new sqlite3.Database('database.db', (err) => {
      if (err) {
        this.logger.error(`[ProductsService] SQLite connection error: ${err.message}`, err.stack);
      } else {
        this.logger.log('[ProductsService] Connected to SQLite DB');
      }
    });

    // Tabelle erstellen
    this.db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        crowd INTEGER,
        minCrowd INTEGER,
        price REAL,
        deliverable INTEGER,
        deliverableAbroad INTEGER,
        material TEXT,
        color TEXT,
        category TEXT,
        isAvailible BOOLEAN NOT NULL,
        createFrom TEXT NOT NULL
        );
    `, (err) => {
      if (err) this.logger.error(`[ProductsService] Error creating products table: ${err.message}`);
      else this.logger.log('[ProductsService] Products table ensured');
    });

    this.db.run(`
      CREATE TABLE IF NOT EXISTS pictures (
        id TEXT PRIMARY KEY,
        fileName TEXT NOT NULL,
        productId TEXT NOT NULL
        );
    `, (err) => {
      if (err) this.logger.error(`[ProductsService] Error creating pictures table: ${err.message}`);
      else this.logger.log('[ProductsService] Pictures table ensured');
    });
  }

  async createProduct(createDto: CreateCallDTO, userId: string): Promise<ProductEntity> {
    return new Promise((resolve, reject) => {
      const product: ProductEntity = {
        id: uuidv4(),
        ...createDto,
        createFrom: userId,
        isAvailible: true,
      };

      // Produkt speichern
      this.db.run(`
        INSERT INTO products (
          id, name, description, crowd, minCrowd, price,
          deliverable, deliverableAbroad, material, color,
          category, isAvailible, createFrom
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        product.id, product.name, product.description, product.crowd, product.minCrowd, product.price,
        product.deliverable, product.deliverableAbroad, product.material, product.color,
        product.category, product.isAvailible ? 1 : 0, product.createFrom
      ], (err) => {
        if (err) {
          this.logger.error(`[ProductsService] Error inserting product: ${err.message}`, err.stack);
          return reject(err);
        }
        this.logger.log(`[ProductsService] Product saved: ${product.name} (ID: ${product.id})`);

        // Bilder speichern
        if (createDto.pictures && createDto.pictures.length > 0) {
          createDto.pictures.forEach((pic: PictureCallDto) => {
            const picture: PictureEntity = {
              id: uuidv4(),
              fileName: pic.fileName,
            };
            this.db.run(`
              INSERT INTO pictures (id, fileName, productId) VALUES (?, ?, ?)
            `, [picture.id, picture.fileName, product.id], (picErr) => {
              if (picErr) {
                this.logger.error(`[ProductsService] Error inserting picture: ${picErr.message}`, picErr.stack);
              } else {
                this.logger.log(`[ProductsService] Picture saved: ${picture.fileName}`);
              }
            });
          });
        }

        resolve(product);
      });
    });
  }

  async getAllProducts(): Promise<AllProducts[]> {
  return new Promise((resolve, reject) => {
    this.db.all(`SELECT * FROM products`, [], (err: Error | null, rows: any[]) => {
      if (err) {
        this.logger.error(`[ProductsService] Error fetching products: ${err.message}`, err.stack);
        return reject(err);
      }

      const products: AllProducts[] = [];
      let processed = 0;

      if (!rows.length) return resolve(products);

      rows.forEach((row) => {
        // Erstes Bild über productId holen
        this.db.get(
          `SELECT fileName FROM pictures WHERE productId = ? LIMIT 1`,
          [row.id],
          (picErr: Error | null, pic?: { fileName: string }) => {
          if (picErr) {
            this.logger.error(`[ProductsService] Error fetching picture for product ${row.id}: ${picErr.message}`);
            return;
          }

          // Debug: gib das Ergebnis direkt aus
          this.logger.log(`[ProductsService] Raw picture result for product ${row.id}: ${JSON.stringify(pic)}`);

          let fileName: string | undefined;
          if (pic && pic.fileName) {
            fileName = pic.fileName; // tatsächlicher Bildname
          } else {
            fileName = undefined; // kein Bild
          }

          this.logger.log(`[ProductsService] Final fileName for product ${row.id}: ${fileName}`);
  
  // Danach kannst du das Produkt weiterverarbeiten

            // User Name + Firstname holen
            this.db.get(`SELECT name, firstname FROM users WHERE id = ?`, [row.createFrom], (userErr: Error | null, userRow: any) => {
              if (userErr || !userRow) {
                this.logger.error(`[ProductsService] Error fetching user for product ${row.id}: ${userErr?.message}`);
                userRow = { name: 'Unknown', firstname: '' };
              }

              const productDto = new AllProducts({
                id: row.id,
                name: row.name,
                price: row.price,
                category: row.category,
                isAvailible: !!row.isAvailible,
                createFrom: `${userRow.name} ${userRow.firstname}`,
                createFromid: row.createFrom,
                pictures: fileName,
              });

              products.push(productDto);
              processed++;

              if (processed === rows.length) {
                this.logger.log(`[ProductsService] Fetched ${products.length} products`);
                resolve(products);
              }
            });
          }
        );
      });
    });
  });
  }

  async getProductDetail(productId: string): Promise<ProductDBDTO> {
  return new Promise((resolve, reject) => {
    // 1. Produkt aus DB holen
    this.db.get(`SELECT * FROM products WHERE id = ?`, [productId], (err: Error | null, row: any) => {
      if (err) {
        this.logger.error(`[ProductsService] Error fetching product ${productId}: ${err.message}`, err.stack);
        return reject(err);
      }

      if (!row) {
        return reject(new Error(`Product ${productId} not found`));
      }

      // 2. Alle Bilder für dieses Produkt abrufen
      this.db.all(`SELECT fileName FROM pictures WHERE productId = ?`, [productId], (picErr: Error | null, picRows: any[]) => {
        if (picErr) {
          this.logger.error(`[ProductsService] Error fetching pictures for product ${productId}: ${picErr.message}`);
          return reject(picErr);
        }

        const pictures = picRows.map(p => ({ fileName: p.fileName })); // nur Dateinamen als PictureDBDto

        // 3. User Name + Firstname holen
        this.db.get(`SELECT name, firstname, hNumber, street, town, pCode, country FROM users WHERE id = ?`, [row.createFrom], (userErr: Error | null, userRow: any) => {
          if (userErr || !userRow) {
            this.logger.error(`[ProductsService] Error fetching user for product ${productId}: ${userErr?.message}`);
            userRow = { name: 'Unknown', firstname: '' };
          }

          // 4. DTO erstellen
          const productDto = new ProductDBDTO({
            id: row.id,
            name: row.name,
            description: row.description,
            crowd: row.crowd,
            minCrowd: row.minCrowd,
            price: row.price,
            deliverable: row.deliverable,
            deliverableAbroad: row.deliverableAbroad,
            material: row.material,
            color: row.color,
            category: row.category,
            isAvailible: !!row.isAvailible,
            createFrom: `${userRow.name} ${userRow.firstname}`,
            createFromID: row.createFrom,
            createFromAdress: `${userRow.country}, ${userRow.pCode} ${userRow.town}, ${userRow.street} ${userRow.hNumber}`,
            pictures: pictures.length > 0 ? pictures : undefined,
          });

          this.logger.log(`[ProductsService] Fetched product ${productId}: ${JSON.stringify(productDto)}`);
          resolve(productDto);
        });
      });
    });
  });
}

async updateProduct(productUpdateDTO: ProductUpdateDTO): Promise<boolean> {
  this.logger.log(`[ProductsService] Product update started for id: ${productUpdateDTO.id}`);

  const prod = new ProductEntity({ ...productUpdateDTO });
  const isAvailible = prod.crowd > prod.minCrowd;

  return new Promise<boolean>((resolve, reject) => {
    const sql = `
      UPDATE products SET
        name = ?, 
        description = ?, 
        crowd = ?, 
        minCrowd = ?, 
        price = ?,
        deliverable = ?, 
        deliverableAbroad = ?, 
        material = ?, 
        color = ?,
        category = ?,
        isAvailible = ?
      WHERE id = ?
    `;

    const params = [
      prod.name,
      prod.description,
      prod.crowd,
      prod.minCrowd,
      prod.price,
      prod.deliverable,
      prod.deliverableAbroad,
      prod.material,
      prod.color,
      prod.category,
      isAvailible,
      prod.id
    ];

    this.db.run(sql, params, function (err: Error | null) {
      if (err) {
        // echter Fehler
        reject(err);
        return;
      }

      if (this.changes === 0) {
        // nichts geupdated (nicht gefunden)
        resolve(true);
        return;
      }

      // erfolgreich geupdated
      resolve(true);
    });
  })
  .then((result) => {
    if (result) {
      this.logger.log(`[ProductsService] Product updated: ${productUpdateDTO.id}`);
    } else {
      this.logger.warn(`[ProductsService] Update failed - product not found: ${productUpdateDTO.id}`);
    }
    return result;
  })
  .catch((err: any) => {
    this.logger.error(
      `[ProductsService] Update failed for product: ${productUpdateDTO.id}`,
      err.stack || err.message
    );
    throw err;
  });
}

async delete(productID: string): Promise<boolean> {
  const id = productID;

  return new Promise<boolean>((resolve, reject) => {

    const sql = `
      DELETE FROM products WHERE id = ?
    `;
    const params = [id];

    this.logger.log(`Delete attempt for product: ${id}`);

    this.db.run(sql, params, function (err: Error | null) {
      if (err) {
        // echter Fehler
        reject(err);
        return;
      }

      if (this.changes === 0) {
        // nichts gefunden
        resolve(true);
        return;
      }

      // erfolgreich gelöscht
      resolve(true);
    });
  })
  .then((result) => {
    if (result) {
      this.logger.log(`Product deleted: ${id}`);
    } else {
      this.logger.warn(`Product not found: ${id}`);
    }
    return result;
  })
  .catch((err: any) => {
    this.logger.error(
      `Delete failed for product: ${id}`,
      err.stack || err.message
    );
    throw err;
  });
}

}