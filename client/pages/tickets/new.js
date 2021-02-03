import React, { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const NewTicket = () => {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title, price
    },
    onSuccess: () => Router.push()

  })

  const onSubmit = (event) => {
    event.preventDefault()
    doRequest()
  }
  const onBlur = () => {
    const value = parceFloat(price)
    if (isNan(value)) {
      return
    }
    setPrice(value.toFixed(2))
  }
  return (
    <div>
      <h1>Create a Ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="formg-group">
          <label htmlFor="">Title</label>
          <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="formg-group">
          <label htmlFor="">Price</label>
          <input className="form-control" value={price} onBlur={onBlur} onChange={(e) => setPrice(e.target.value)} />
        </div>
        {errors}
        <button className="btn btn-primary" type="submit">Submit</button>
      </form>
    </div>
  )
}

export default NewTicket
