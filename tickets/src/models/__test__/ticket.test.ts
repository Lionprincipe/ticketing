import { Ticket } from '../tickets'

it('implements optimistc concurrency control', async (done) => {
  //create an instance of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  })
  //Save the ticket to the database
  await ticket.save()
  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)
  //make two separate changes to the ticket we fetched
  firstInstance!.set({ price: 34 })
  secondInstance!.set({ price: 40 })
  //save the first fetched ticket
  await firstInstance!.save()
  //save the first fetched ticket
  try {
    await secondInstance!.save()
  } catch (error) {
    return done()
  }
  throw new Error('Should not reach this point')
})

it('increment the version number on multiple saves ', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  })
  //Save the ticket to the database
  await ticket.save()
  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id)
  await firstInstance!.save()
  expect(firstInstance!.version).toEqual(1)
  const secondInstance = await Ticket.findById(ticket.id)
  await secondInstance!.save()
  expect(secondInstance!.version).toEqual(2)
  const thirdInstance = await Ticket.findById(ticket.id)
  await thirdInstance!.save()
  expect(thirdInstance!.version).toEqual(3)
  expect(secondInstance!.version).toBeGreaterThan(firstInstance!.version)
  expect(thirdInstance!.version).toBeGreaterThan(secondInstance!.version)
})
