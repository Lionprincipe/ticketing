import { Listener, TicketCreatedEvent } from '@lgticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketCreatedListener } from '../ticket-created-listener'

it('creates and saves ticket', async () => {
  const { listener, msg, data } = await setup()

  // call the onMEssage function with data object + message object
  await listener.onMessage(data, msg)
  //write assertions to make sure a ticket was created!
  const ticket = await Ticket.findById(data.id)
  expect(ticket).toBeDefined()
  expect(ticket!.title).toEqual(data.title)
  expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
  const { listener, msg, data } = await setup()

  // call the onMEssage function with data object + message object
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

function setup() {
  //create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Concert Celine Dion',
    price: 20,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  }
  // create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, data, msg }
}
