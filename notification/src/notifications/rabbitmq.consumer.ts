import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ChannelModel, connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private connection!: ChannelModel;
  private channel!: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
    this.connection = await connect(rabbitmqUrl!);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange('order.exchange', 'direct', {
      durable: true,
    });

    await this.channel.assertQueue(
      'notification.queue', // queue name
      {
        durable: true,
      },
    );

    await this.channel.bindQueue(
      'notification.queue', // queue name
      'order.exchange', // exchange name
      'order.created', // binding key
    );

    await this.channel.assertQueue('notification.retry', {
      durable: true,
      arguments: {
        'x-message-ttl': 5000,
        'x-dead-letter-exchange': 'order.exchange',
        'x-dead-letter-routing-key': 'order.created',
      },
    });

    await this.channel.assertQueue('notification.dlq', {
      durable: true,
    });

    await this.channel.prefetch(3); // process one unacknowledged message at a time

    await this.channel.consume(
      'notification.queue', // queue name
      (message) => {
        if (!message) return;

        const order = JSON.parse(message.content.toString());
        try {
          setTimeout(() => {
            this.notificationsService.orderCreatedNotification(order);
            // process.exit(1);

            this.channel.ack(message);
          }, 10000);
        } catch (error) {
          const retryCount =
            (message.properties.headers?.['x-retry-count'] || 0) + 1;

          if (retryCount >= 3) {
            this.channel.sendToQueue('notification.dlq', message.content, {
              persistent: true,
              headers: {
                'x-retry-count': retryCount,
              },
            });
            console.log(
              `Order ${order.orderId} moved to DLQ after ${retryCount} attempts`,
            );
          } else {
            console.log(
              'Notification service failed. Sending to retry queue...',
            );
            this.channel.sendToQueue(
              'notification.retry', // queue name
              message.content, // message content
              {
                persistent: true,
                headers: {
                  'x-retry-count': retryCount,
                },
              },
            );
          }
          this.channel.ack(message);
        }
      },

      {
        noAck: false,
      },
    );

    console.log('Notification service connected to RabbitMQ');
    console.log('Notification queue ready');
  }
}
