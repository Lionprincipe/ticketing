import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'

import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'

import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/orders for post requests', async () => {
  const response = await request(app).post('/api/orders').send({})
  expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/orders').send({}).expect(401)
})

it('return a status other than 401 if the user is signe in', async () => {
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({})
  expect(response.status).not.toEqual(401)
})

it('returns an error if the ticket does not exist', async () => {
  ///create a ticket
  const ticketId = mongoose.Types.ObjectId()
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ ticketId })
    .expect(404)
})

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    title: ' Concert Markus',
    price: 200,
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()
  const order = Order.build({
    ticket,
    userId: 'sdafdsadfsadfasf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  })
  await order.save()
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ ticketId: ticket.id })
    .expect(400)
})

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    title: ' Concert Markus',
    price: 200,
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ ticketId: ticket.id })
    .expect(201)
  expect(response.body.ticket.id).toEqual(ticket.id)
})

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    title: ' Concert Markus',
    price: 200,
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signup())
    .send({ ticketId: ticket.id })
    .expect(201)
  expect(response.body.ticket.id).toEqual(ticket.id)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
