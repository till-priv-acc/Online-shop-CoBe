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
                isAdmin: row.isAdmin, // 0/1 → boolean
              }),
          );
          resolve(users);
        }
      });
    });
  }


async findById(id: string): Promise<GetUserDto | null> {
  return new Promise((resolve, reject) => {
    // Nur die Felder auswählen, die GetUserDto hat
    this.db.get(
      `SELECT id, name, email, isAdmin FROM users WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        // row direkt als GetUserDto casten
        const userRow = row as GetUserDto;

        resolve(userRow);
      }
    );
  });
}

  async validateUser(email: string, plainPassword: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Email:', email);
    console.log('Password (incoming):', plainPassword);

    // Typ definieren, dass row id und password hat
    type UserRow = { id: string; password: string };

    this.db.get(
      `SELECT id, password FROM users WHERE email = ?`,
      [email],
      async (err, row) => {
        if (err) {
          console.log('DB ERROR:', err);
          return reject(err);
        }

        const userRow = row as UserRow | undefined;

        // Wenn kein User oder Passwort stimmt nicht → gleiche Fehlermeldung
        if (!userRow) {
          console.log('INVALID CREDENTIALS');
          return resolve(null);
        }

        const isMatch = await bcrypt.compare(plainPassword, userRow.password);

        if (!isMatch) {
          console.log('INVALID CREDENTIALS');
          return resolve(null);
        }

        console.log('LOGIN SUCCESS, USER ID:', userRow.id);
        resolve(userRow.id);
      }
    );
  });
}
}