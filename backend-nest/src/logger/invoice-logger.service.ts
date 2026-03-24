import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class InvoiceLogger {
  private logger;

  constructor() {
    // Log-Ordner erstellen, falls nicht existiert
    const logDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
          (info) => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`,
        ),
      ),
      transports: [
        new transports.File({ filename: path.join(logDir, 'invoice.log') }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} ${trace || ''}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}