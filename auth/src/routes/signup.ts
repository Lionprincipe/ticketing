import express, { Response, Request } from 'express'
import jwt from 'jsonwebtoken'
import { BadRequestError, validateRequest } from '@lgticket/common'

import { body } from 'express-validator'
import { User } from '../models/user'

const router = express.Router()

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 32 })
      .withMessage('Password must be between 8 and 32 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      throw new BadRequestError('Email in use')
    }

    const user = User.build({ email, password })
    await user.save()

    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY! //checked at the start function in index.js
    )
    req.session = { jwt: userJwt }
    res.status(201).send(user)
  }
)

export { router as signupRouter }
