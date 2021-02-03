import React from 'react'
import { useEffect } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

const Signout = () => {
  const url = '/api/users/signout'
  const method = 'post'
  const body = {}
  const onSuccess = () => Router.push('/')
  const { doRequest } = useRequest({ url, method, body, onSuccess })
  useEffect(() => {
    doRequest()
  }, [])


  return (
    <div>
      Signin out...
    </div>
  )
}

export default Signout
