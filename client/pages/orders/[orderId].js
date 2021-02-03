import React from 'react'
import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'
const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLEft] = useState(0)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id
    },
    onSuccess: (payment) => { }
  })


  useEffect(() => {
    const findTimeLeft = () => {
      const msLEft = new Date(order.expiresAt) - new Date()
      setTimeLEft(Math.round(msLEft / 1000))
    }
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId)
    }

  }, [])

  if (timeLeft < 0) {
    return <div> Order expired</div>
  }

  return (
    <div>
      Time left to pay {timeLeft} seconds
      <StripeCheckout
        token={(token) => doRequest({ token })}
        stripeKey="pk_test_alvEmcMhwFXJfdPzYMWLI1ah00sJRO3t3t"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)
  return { order: data }
}
export default OrderShow
