import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserLogger } from '../logger/user-logger.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // User-Repository verfügbar machen
  controllers: [UsersController],
  providers: [UsersService, UserLogger],
  exports: [UsersService],
})
export class UsersModule {}