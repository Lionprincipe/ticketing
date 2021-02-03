import request from 'supertest'
import { app } from '../../app'
import { Ticket } from '../../models/tickets'
import { natsWrapper } from '../../nats-wrapper'

it('has a route handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({})
  expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401)
})

it('return a status other than 401 if the user is signe in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({})
  expect(response.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: '', price: 10 })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ price: 10 })
    .expect(400)
})

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'dsgfdsgfdsfg', price: -10 })
    .expect(400)

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'xgdffdsgfdsgf' })
    .expect(400)
})

it('creates a ticket with valid inputs', async () => {
  // add in a check to make sure a ticket was saved
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)
  const ticket = { title: 'xgdffdsgfdsgf', price: 200 }
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(ticket)
    .expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].price).toEqual(ticket.price)
  expect(tickets[0].title).toEqual(ticket.title)
})

it('publishes an event', async () => {
  const ticket = { title: 'xgdffdsgfdsgf', price: 200 }
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(ticket)
    .expect(201)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})