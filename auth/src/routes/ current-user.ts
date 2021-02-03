import express, { Response, Request } from 'express'
import { currentUser } from '@lgticket/common'

const router = express.Router()

router.get(
  '/api/users/currentuser',
  currentUser,
  (req: Request, res: Response) => {
    return res.send({ currentUser: req.currentUser || null })
  }
)

export { router as currentUserRouter }
