import { Listener, OrderCreatedEvent, OrderStatus } from '@lgticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'Dafadfa',
    userId: 'dadfdafsda',
    status: OrderStatus.Created,
    ticket: {
      id: 'Dsadafda',
      price: 232,
    },
  }
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { msg, listener, data }
}

it('replcates the order info', async () => {
  const { msg, listener, data } = await setup()
  await listener.onMessage(data, msg)
  const order = await Order.findById(data.id)
  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
  const { msg, listener, data } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
