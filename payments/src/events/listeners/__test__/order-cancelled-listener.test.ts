import { Listener, OrderCancelledEvent, OrderStatus } from '@lgticket/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCancelledListener } from '../order-cancelled-listener'

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = await Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'dadfdafsda',
    price: 10,
    status: OrderStatus.Created,
  })
  await order.save()
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'Dsadafda',
    },
  }
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { msg, listener, data, order }
}

it('set the order statut at cancelled order', async () => {
  const { msg, listener, data, order } = await setup()
  await listener.onMessage(data, msg)
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const { msg, listener, data } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
