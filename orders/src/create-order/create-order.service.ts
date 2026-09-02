import { Injectable } from '@nestjs/common';
import { RabbitMQPublisher } from './rabbitmq.publisher';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class CreateOrderService {
  constructor(private readonly rabbitMQPublisher: RabbitMQPublisher) {}

  createOrder(createOrderDto: CreateOrderDto) {
    const order = {
      orderId: 123,
      ...createOrderDto,
    };

    this.rabbitMQPublisher.publishOrderCreated(order);
    return order;
  }
}
