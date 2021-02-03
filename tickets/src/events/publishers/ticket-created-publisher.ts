import { Publisher, Subjects, TicketCreatedEvent } from '@lgticket/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
