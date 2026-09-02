import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CreateOrderModule } from './create-order/create-order.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CreateOrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
