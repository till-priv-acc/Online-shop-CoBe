import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import { UserEntity, CreateUserDto, GetUserDto } from './entities/users.dto';

@Injectable()
export class UsersService {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('database.db', (err) => {
      if (err) console.error('SQLite Error:', err.message);
      else console.log('Connected to SQLite DB.');
    });

    // Tabelle erstellen (nur die wichtigsten Felder, Rest optional)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        firstname TEXT,
        hNumber TEXT,
        street TEXT,
        town TEXT,
        pCode TEXT,
        country TEXT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isAdmin BOOLEAN NOT NULL
      )
    `);
  }

  // User erstellen mit Passwort-Hash
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new UserEntity({ ...createUserDto, password: hashedPassword });

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users(
          id, name, firstname, hNumber, street, town, pCode, country, email, password, isAdmin
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.name,
          user.firstname,
          user.hNumber,
          user.street,
          user.town,
          user.pCode,
          user.country,
          user.email,
          user.password,
          user.isAdmin ? 1 : 0
        ],
        (err) => {
          if (err) reject(err);
          else resolve(
            new GetUserDto({
              id: user.id,
              name: user.name,
              firstname: user.firstname,
              hNumber: user.hNumber,
              street: user.street,
              town: user.town,
              pCode: user.pCode,
              country: user.country,
              email: user.email,
              isAdmin: user.isAdmin
            })
          );
        }
      );
    });
  }

  // findById
async findById(id: string): Promise<GetUserDto | null> {
  return new Promise((resolve, reject) => {
    this.db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row: any) => {
      if (err) return reject(err);
      if (!row) return resolve(null);

      // row direkt auf DTO-Felder mappen
      const userDto = new GetUserDto({
        id: row.id,
        name: row.name,
        firstname: row.firstname,
        hNumber: row.hNumber,
        street: row.street,
        town: row.town,
        pCode: row.pCode,
        country: row.country,
        email: row.email,
        isAdmin: !!row.isAdmin
      });

      resolve(userDto);
    });
  });
}

// findAll
async findAll(): Promise<GetUserDto[]> {
  return new Promise((resolve, reject) => {
    this.db.all(`SELECT * FROM users`, [], (err, rows: any[]) => {
      if (err) return reject(err);

      const users = rows.map((row) => new GetUserDto({
        id: row.id,
        name: row.name,
        firstname: row.firstname,
        hNumber: row.hNumber,
        street: row.street,
        town: row.town,
        pCode: row.pCode,
        country: row.country,
        email: row.email,
        isAdmin: !!row.isAdmin
      }));

      resolve(users);
    });
  });
}

  async validateUser(email: string, plainPassword: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    this.db.get(
      `SELECT id, password FROM users WHERE email = ?`,
      [email],
      async (err, row: any) => { // row als any
        if (err) return reject(err);
        if (!row) return resolve(null);

        // row als UserRow casten
        const userRow = row as { id: string; password: string };

        const isMatch = await bcrypt.compare(plainPassword, userRow.password);
        resolve(isMatch ? userRow.id : null);
      }
    );
  });
}
}