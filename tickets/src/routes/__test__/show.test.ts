import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'

it('it return 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app).get(`/api/tickets/${id}`).send().expect(404)
})

it('it return the ticket  if the ticket is not found', async () => {
  const ticket = { title: 'Concert', price: 200 }
  //create a ticket
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(ticket)
    .expect(201)
  const url = `/api/tickets/${response.body.id}`
  //call the one ticket
  const ticketResponse = await request(app).get(url).send().expect(200)
  expect(ticketResponse.body.title).toEqual(ticket.title)
  expect(ticketResponse.body.price).toEqual(ticket.price)
})
