import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'

import { Ticket } from '../../models/ticket'

it('it returns 401 if the user tires to fetch enother user order', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save()
  const owner = global.signup()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', owner)
    .send({ ticketId: ticket.id })
    .expect(201)
  const user = global.signup()
  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(401)
})

it('fetches the order', async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })
  await ticket.save()
  const user = global.signup()
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(200)
  expect(response.body.id).toEqual(order.id)
  expect(response.body.ticket.id).toEqual(ticket.id)
})
