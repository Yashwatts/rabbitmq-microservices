import { Module } from '@nestjs/common';
import { RabbitMQPublisher } from './rabbitmq.publisher';
import { CreateOrderController } from './create-order.controller';
import { CreateOrderService } from './create-order.service';

@Module({
  imports: [],
  controllers: [CreateOrderController],
  providers: [RabbitMQPublisher, CreateOrderService],
  exports: [RabbitMQPublisher, CreateOrderService],
})

export class CreateOrderModule {}
