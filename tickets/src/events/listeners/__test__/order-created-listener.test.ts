import { Ticket } from '../../../models/tickets'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { OrderCreatedEvent, OrderStatus } from '@lgticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)
  const ticket = Ticket.build({
    title: 'concert 34',
    price: 56,
    userId: 'assdfadfdsa',
  })
  await ticket.save()
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'Dadfasdafda',
    expiresAt: 'dsdadafd',
    version: 1,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { msg, ticket, listener, data }
}

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const updatedTicket = await Ticket.findById(ticket.id)
  console.log(updatedTicket)
  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(ticketUpdatedData.orderId).toEqual(data.id)
})
