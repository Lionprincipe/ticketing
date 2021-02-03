import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'
import { Ticket } from '../../models/tickets'

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signup())
    .send({ title: 'Concert Maria Nejo', price: 400 })
    .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'Concert Maria Nejo', price: 400 })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'Concert Maria Nejo', price: 400 })

  expect(response.status).toEqual(201)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({ title: 'Concert Maria Rihana', price: 500 })
    .expect(401)
})

it('returns a 400 if the user provides an invalid titles or price', async () => {
  const cookie = global.signup()

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Concert Maria Nejo', price: 400 })

  expect(response.status).toEqual(201)
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 500 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Covid-19 Conference', price: -500 })
    .expect(400)
})

it('updates the ticket if valid inputs are provided', async () => {
  const cookie = global.signup()
  const updateTicket = { title: 'Covid-19 Conference', price: 500 }

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Concert Maria Nejo', price: 400 })

  const updateResponse = await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateTicket)
    .expect(200)

  const newlyUpdatedTicket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()

  expect(newlyUpdatedTicket.body.title).toEqual(updateTicket.title)
  expect(newlyUpdatedTicket.body.price).toEqual(updateTicket.price)
})

it('publishes an event', async () => {
  const cookie = global.signup()
  const updateTicket = { title: 'Covid-19 Conference', price: 500 }

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Concert Maria Nejo', price: 400 })

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateTicket)
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signup()
  const updateTicket = { title: 'Covid-19 Conference', price: 500 }

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'Concert Maria Nejo', price: 400 })

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send(updateTicket)
    .expect(400)
})
