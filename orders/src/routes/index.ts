import express, { Request, Response } from 'express'
import { requireAuth } from '@lgticket/common'
import { Order } from '../models/order'
// import { body } from 'express-validator'

const router = express.Router()

router.get(
  '/api/orders',
  requireAuth,
  [],
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id,
    }).populate('ticket')
    res.send(orders)
  }
)
export { router as indexOrderRouter }
