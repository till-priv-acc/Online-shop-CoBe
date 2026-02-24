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

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isAdmin BOOLEAN NOT NULL
      )
    `);
  }

  // User erstellen mit Passwort-Hash
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    // Passwort hashen
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // SaltRounds = 10
    const user = new UserEntity({ ...createUserDto, password: hashedPassword });

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users(id, name, email, password, isAdmin) VALUES(?, ?, ?, ?, ?)`,
        [user.id, user.name, user.email, user.password, user.isAdmin ? 1 : 0],
        (err) => {
          if (err) reject(err);
          else resolve(new GetUserDto(user)); // Passwort nicht zurückgeben
        }
      );
    });
  }

  // Alle User abrufen
  async findAll(): Promise<GetUserDto[]> {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM users`, [], (err, rows: any[]) => {
        if (err) reject(err);
        else {
          const users = rows.map(
            (row) =>
              new GetUserDto({
                id: row.id,
                name: row.name,
                email: row.email,
                isAdmin: !!row.isAdmin, // 0/1 → boolean
              }),
          );
          resolve(users);
        }
      });
    });
  }
}