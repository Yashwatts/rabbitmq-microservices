import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';

@Injectable()
export class RabbitMQPublisher implements OnModuleInit {
  private connection!: ChannelModel;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    this.connection = await connect(rabbitmqUrl!);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('order.exchange', 'direct', {
      durable: true,
    });

    console.log('Connected to RabbitMQ');
    console.log('Exchange ready');
  }

  publishOrderCreated(order: object) {
    this.channel.publish(
      'order.exchange', // exchange
      'order.created', // routing key
      Buffer.from(JSON.stringify(order)), // turns text into bytes
      {
        persistent: true,
      },
    );

    console.log('order.created published');
  }
}
