import React from 'react'
import { useState } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const url = '/api/users/signup'
  const method = 'post'
  const body = { email, password }
  const onSuccess = () => Router.push('/')

  const { errors, doRequest } = useRequest({ url, method, body, onSuccess })


  const onSubmit = async (event) => {
    event.preventDefault()
    doRequest()
  }

  return (
    <form onSubmit={onSubmit}>
      <h1> Sign Up</h1>
      <div className="form-group">
        <label > Email Address</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
      </div>
      <div className="form-group">
        <label > Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  )
}

export default Signup
