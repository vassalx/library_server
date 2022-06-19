import { Request, Response } from 'express'
import { OrderStatus } from 'types'
import OrderServices from '../services/order'

const getAll = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined
    const userId = req.query.userId as string | undefined
    const startAt = Number(req.query.startAt as string)
    const limit = Number(req.query.limit as string)
    const result = await OrderServices.getAll({
      userId,
      startAt,
      limit,
      search,
    })
    return res.status(200).send(result)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const create = async (req: Request, res: Response) => {
  const { userId, userFullName, userEmail, items, dateToReturn } = req.body
  try {
    const order = await OrderServices.create({
      userId,
      userFullName,
      userEmail,
      items,
      dateToReturn,
    })
    return res.status(200).send(order)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id
    const newStatus = req.body.status as OrderStatus
    const order = await OrderServices.updateOrderStatus(orderId, newStatus)
    return res.status(200).send(order)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const OrderController = {
  getAll,
  create,
  updateOrderStatus,
}

export default OrderController
