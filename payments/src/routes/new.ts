import express, { Request, Response } from 'express'
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
} from '@lgticket/common'
import { body } from 'express-validator'

import { natsWrapper } from '../nats-wrapper'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'

const router = express.Router()

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('orderId').not().isEmpty().withMessage('orderId is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body
    const order = await Order.findById(orderId)
    if (!order) {
      throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannor pay for a cancelled order')
    }

    const charge = await stripe.charges.create({
      currency: 'eur',
      amount: order.price * 100,
      source: token,
    })
    const payment = Payment.build({ orderId, stripeId: charge.id })

    await payment.save()

    return res.status(201).send({ sucess: true })
  }
)

export { router as createChargeRouter }
