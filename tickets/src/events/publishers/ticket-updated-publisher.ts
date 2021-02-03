import { Publisher, Subjects, TicketUpdatedEvent } from '@lgticket/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
