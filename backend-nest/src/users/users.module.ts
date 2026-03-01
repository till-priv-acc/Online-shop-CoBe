import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserLogger } from '../logger/user-logger.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserLogger],
  exports: [UsersService]
})
export class UsersModule {}