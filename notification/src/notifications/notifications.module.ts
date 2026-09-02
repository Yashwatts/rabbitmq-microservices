import { Module } from '@nestjs/common';
import { RabbitMQConsumer } from './rabbitmq.consumer';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [RabbitMQConsumer, NotificationsService],
  exports: [RabbitMQConsumer, NotificationsService],
})

export class NotificationsModule {}
