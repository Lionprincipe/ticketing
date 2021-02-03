import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { Subjects } from './subjects'

import { TicketCreatedEvent } from './ticket-created-event'
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = 'payement-service-queue-group'

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('event data!', data)
    msg.ack()
  }
}
