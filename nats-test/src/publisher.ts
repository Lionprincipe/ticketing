import nats from 'node-nats-streaming'
import { TicketCreatedPublisher } from './events/ticket-created-publisher'
console.clear()
//instance of the clients use to connect to a nats stream server
const stan = nats.connect('ticketing', 'abc', { url: 'http://localhost:4222' })

stan.on('connect', async () => {
  console.log('Publisher connected to NATS')

  const data = { id: '123', title: 'Concert', price: 23 }
  const publisher = new TicketCreatedPublisher(stan)
  try {
    await publisher.publish(data)
  } catch (err) {
    console.error(err)
  }
})
