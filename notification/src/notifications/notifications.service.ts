import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private notifications: any[] = [];

  private processedOrders = new Set<number>();

  orderCreatedNotification(order: any) {
    // throw new Error('Simulated error for testing retry mechanism');
    if (this.processedOrders.has(order.orderId)) {
      console.log(
        `Order ${order.orderId} has already been processed. Skipping notification.`,
      );
      return;
    }
    this.processedOrders.add(order.orderId);

    const notification = {
      message: `Order ${order.orderId} has been created for user ${order.userId}`,
      order,
    };
    this.notifications.push(notification);
    console.log('Notification sent:', notification);
  }

  getNotifications() {
    return this.notifications;
  }
}
