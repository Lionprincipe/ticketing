import { Publisher, OrderCreatedEvent, Subjects } from '@lgticket/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
