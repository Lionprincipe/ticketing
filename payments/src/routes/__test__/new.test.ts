import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/order'
import { OrderStatus } from '@lgticket/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

jest.mock('../../stripe')

it('returns a 404 when purchasing an order taht does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'adaffda',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it('returns a 401 when the user is not owner of the order', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 30,
  })
  await order.save()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'adaffda',
      orderId: order.id,
    })
    .expect(401)
})

it('returns a 400 when purchasing a cancelled user', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Cancelled,
    price: 30,
  })
  await order.save()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'adaffda',
      orderId: order.id,
    })
    .expect(400)
})

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Created,
    price: 30,
  })

  await order.save()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
  expect(chargeOptions.source).toEqual('tok_visa')
  expect(chargeOptions.amount).toEqual(30 * 100)
  expect(chargeOptions.currency).toEqual('eur')
})
