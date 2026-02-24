import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],       // UsersModule muss hier rein
  controllers: [AppController], // bleibt, weil dein AppController etwas macht
  providers: [AppService],      // bleibt, weil dein AppService etwas macht
})
export class AppModule {}
