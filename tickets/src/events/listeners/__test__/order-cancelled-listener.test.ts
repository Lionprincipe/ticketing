import { Ticket } from '../../../models/tickets'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'
import { OrderCancelledEvent, OrderStatus } from '@lgticket/common'
import mongoose, { mongo } from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)
  const orderId = mongoose.Types.ObjectId().toHexString()
  const ticket = Ticket.build({
    title: 'concert 34',
    price: 56,
    userId: 'assdfadfdsa',
  })
  ticket.set({ orderId })
  await ticket.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  }
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { msg, ticket, listener, data }
}

it('updates the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).not.toBeDefined()
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
  expect(ticketUpdatedData.orderId).not.toBeDefined()
})
