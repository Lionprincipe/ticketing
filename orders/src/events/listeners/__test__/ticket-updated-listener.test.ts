import { TicketUpdatedEvent } from '@lgticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'

async function setup() {
  //update an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)
  // update a fake data event
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 44,
  })

  await ticket.save()

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'Concert Celine Dion+ Jay-z',
    price: 99,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  }
  // update a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg, ticket }
}

it('updates and saves ticket', async () => {
  const { listener, msg, data, ticket } = await setup()

  // call the onMEssage function with data object + message object
  await listener.onMessage(data, msg)
  //write assertions to make sure a ticket was updated!
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { listener, msg, data } = await setup()
  // // call the onMEssage function with data object + message object
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event is ahead on version number', async () => {
  const { listener, msg, data } = await setup()
  data.version = 10
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled()
})
