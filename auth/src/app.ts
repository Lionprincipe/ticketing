import express, { Response, Request } from 'express'
import cookieSession from 'cookie-session'
import 'express-async-errors'
import { json } from 'body-parser'
import mongoose from 'mongoose'

import { errorHandler, NotFoundError } from '@lgticket/common/'

import { currentUserRouter } from './routes/ current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

const app = express()
app.set('trust proxy', true)
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)

app.use(json())

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

app.all('*', () => {
  throw new NotFoundError()
})

app.use(errorHandler)

export { app }
