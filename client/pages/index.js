import Link from 'next/link'
import React from 'react'


export const Home = ({ currentUser, tickets }) => {
  const message = currentUser ? 'You are signin' : ' You are not signin'
  const ticketList = tickets.map(ticket => {
    return (<tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href="tickets/[ticketId]" as={`/tickets/${tickets.id}`}> <a>view</a></Link>
      </td>
    </tr>

    )
  })
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {ticketList}
        </tbody>
      </table>
    </div>
  )
}

Home.getInitialProps = async (context, client, currentUser,) => {
  const { data } = await client.get('/api/tickets')
  return { tickets: data }
}
export default Home