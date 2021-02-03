import { Publisher, OrderCancelledEvent, Subjects } from '@lgticket/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}
