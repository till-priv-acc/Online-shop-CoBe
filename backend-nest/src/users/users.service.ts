import { Injectable, Session } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import { UserEntity, CreateUserDto, GetUserDto, UpdateUserDto } from './entities/users.dto';
import { UserLogger } from '../logger/user-logger.service';

@Injectable()
export class UsersService {
  private db: sqlite3.Database;

  constructor(private readonly logger: UserLogger) {
    this.db = new sqlite3.Database('database.db', (err) => {
      if (err) {
        console.error('SQLite Error:', err.message);
        this.logger.error(`[UsersService] SQLite connection error: ${err.message}`);
      } else {
        console.log('Connected to SQLite DB.');
        this.logger.log('[UsersService] Connected to SQLite DB');
      }
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
        type TEXT NOT NULL
      )
    `, (err) => {
      if (err) this.logger.error(`[UsersService] Error creating table: ${err.message}`);
      else this.logger.log('[UsersService] Users table ensured');
    });

    this.logger.log("[UsersService] Initialize Database");
  }

  // User erstellen mit Passwort-Hash
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    this.logger.log(`[UsersService] User creation started for email: ${createUserDto.email}`);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new UserEntity({ ...createUserDto, password: hashedPassword });

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users(
          id, name, firstname, hNumber, street, town, pCode, country, email, password, type
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
          user.type
        ],
        (err) => {
          if (err) {
            this.logger.error(`[UsersService] Error inserting user ${user.email}: ${err.message}`, err.stack);
            reject(err);
          } else {
            this.logger.log(`[UsersService] User created successfully: ${user.email}`);
            resolve(
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
                type: user.type
              })
            );
          }
        }
      );
    });
  }

async updateUser(userId: string,updateUserDto: UpdateUserDto): Promise<boolean> {
  this.logger.log(`[UsersService] User update started for userId: ${userId}`);

  const user = new UserEntity({ ...updateUserDto });

  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users SET
        name = ?,
        firstname = ?,
        hNumber = ?,
        street = ?,
        town = ?,
        pCode = ?,
        country = ?
      WHERE id = ?
    `;

    const params = [
      user.name,
      user.firstname,
      user.hNumber,
      user.street,
      user.town,
      user.pCode,
      user.country,
      userId
    ];

    this.db.run(sql, params, (err: Error | null) => {
      if (err) {
        this.logger.error(
          `[UsersService] Error updating user ${user.id}: ${err.message}`,
          err.stack
        );
        return reject(err);
      }

      // @ts-ignore: sqlite3 sets `this.changes` in the callback
      if (this.changes === 0) {
        this.logger.log(`[UsersService] No user found with id: ${user.id}`);
        return resolve(false);
      }

      this.logger.log(`[UsersService] User updated successfully: ${user.id}`);
      resolve(true);
    });
  });
}

  // findById
  async findById(id: string): Promise<GetUserDto | null> {
    this.logger.log(`[UsersService] Fetching user by ID: ${id}`);
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row: any) => {
        if (err) {
          this.logger.error(`[UsersService] Error fetching user by ID ${id}: ${err.message}`);
          return reject(err);
        }
        if (!row) {
          this.logger.warn(`[UsersService] No user found with ID: ${id}`);
          return resolve(null);
        }

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
          type: row.type
        });

        this.logger.log(`[UsersService] User found: ${userDto.email}`);
        resolve(userDto);
      });
    });
  }

  // findAll
  async findAll(): Promise<GetUserDto[]> {
    this.logger.log('[UsersService] Fetching all users');
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM users`, [], (err, rows: any[]) => {
        if (err) {
          this.logger.error(`[UsersService] Error fetching all users: ${err.message}`);
          return reject(err);
        }

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
          type: row.type
        }));

        this.logger.log(`[UsersService] Total users fetched: ${users.length}`);
        resolve(users);
      });
    });
  }

// updatePassword
async updatePassword(
  userId: string,
  currentPlainPassword: string,
  newPlainPassword: string
): Promise<boolean> {
  this.logger.log(`[UsersService] Updating password for userId: ${userId}`);

  return new Promise((resolve, reject) => {
    this.db.get(
      `SELECT password FROM users WHERE id = ?`,
      [userId],
      async (err, row: any) => {
        if (err) {
          this.logger.error(
            `[UsersService] Error fetching user ${userId}: ${err.message}`
          );
          return reject(err);
        }

        if (!row) {
          this.logger.warn(
            `[UsersService] No user found with id: ${userId}`
          );
          return resolve(false);
        }

        const isMatch = await this.validatePassword(
          currentPlainPassword,
          row.password
        );

        if (!isMatch) {
          this.logger.warn(
            `[UsersService] Invalid current password for userId: ${userId}`
          );
          return resolve(false);
        }

        const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

        this.db.run(
          `UPDATE users SET password = ? WHERE id = ?`,
          [hashedPassword, userId],
          function (updateErr) {
            if (updateErr) {
              reject(updateErr);
              return;
            }

            resolve(this.changes > 0);
          }
        );
      }
    );
  });
}

async updateUserRole(
  userId: string,
  userRole: string
): Promise<boolean> {
  this.logger.log(`[UsersService] Updating role for userId: ${userId}`);

  return new Promise((resolve, reject) => {
    const newUserRole = userRole; // Sicherstellen, dass Boolean

    this.db.run(
      `UPDATE users SET type = ? WHERE id = ?`,
      [newUserRole, userId],
      function (err) {
        if (err) {
          console.error(`[UsersService] Error updating role for userId ${userId}:`, err);
          reject(err);
          return;
        }

        console.log(`[UsersService] Role updated for userId ${userId}, changes: ${this.changes}`);
        resolve(this.changes > 0);
      }
    );
  });
}

  // validateUser
  async validateUser(email: string, plainPassword: string): Promise<string | null> {
    this.logger.log(`[UsersService] Validating user login for email: ${email}`);
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT id, password FROM users WHERE email = ?`,
        [email],
        async (err, row: any) => {
          if (err) {
            this.logger.error(`[UsersService] Error validating user ${email}: ${err.message}`);
            return reject(err);
          }
          if (!row) {
            this.logger.warn(`[UsersService] No user found with email: ${email}`);
            return resolve(null);
          }

          const userRow = row as { id: string; password: string };
          const isMatch = await this.validatePassword(plainPassword, userRow.password);

          if (isMatch) {
            this.logger.log(`[UsersService] User validated successfully: ${email}`);
            resolve(userRow.id);
          } else {
            this.logger.warn(`[UsersService] Invalid password for user: ${email}`);
            resolve(null);
          }
        }
      );
    });
  }

  async validatePassword(pwdFrontend: string, pwdDB: string) {
        return bcrypt.compare(pwdFrontend, pwdDB);
  }
}