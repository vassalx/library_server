import express from 'express'

import OrderController from '../controllers/order'
import authenticateJWT from '../middleware/authenticateJwt'
import roleCheck from '../middleware/roleCheck'

const orderRouter = express.Router()

orderRouter.get(
  '/',
  [authenticateJWT, roleCheck(['ADMIN', 'USER'])],
  OrderController.getAll,
)
orderRouter.post(
  '/:id',
  [authenticateJWT, roleCheck(['ADMIN', 'USER'])],
  OrderController.updateOrderStatus,
)
orderRouter.post(
  '/',
  [authenticateJWT, roleCheck(['USER'])],
  OrderController.create,
)

export default orderRouter
