import express, { Response, Request } from 'express'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import { validateRequest, BadRequestError } from '@lgticket/common'

import { Password } from '../services/password'
import { User } from '../models/user'

const router = express.Router()

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must suply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials')
    }
    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    )
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials')
    }
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY! //checked at the start function in index.js
    )
    req.session = { jwt: userJwt }
    res.status(200).send(existingUser)
  }
)

export { router as signinRouter }
