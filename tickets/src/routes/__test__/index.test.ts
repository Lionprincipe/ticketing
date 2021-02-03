import request from 'supertest'
import { app } from '../../app'

it('it can  fetch a list of tickets', async () => {
  const createdTickets = [
    { title: 'Concert', price: 200 },
    { title: 'Grand Prix', price: 1000 },
    { title: 'Football Match', price: 100 },
    { title: 'Handball Match', price: 300 },
  ]
  createdTickets.forEach(async (ticket) => {
    await createTicket(ticket).expect(201)
  })
  const response = await request(app).get('/api/tickets').send().expect(200)
  expect(response.body.length).toEqual(createdTickets.length)
})

function createTicket(ticket: { title: string; price: number }): request.Test {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send(ticket)
}
