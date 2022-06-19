import { Router } from 'express'
import authRouter from './auth'
import bookRouter from './book'
import orderRouter from './order'

const routes = Router()

routes.use('/book', bookRouter)
routes.use('/auth', authRouter)
routes.use('/order', orderRouter)

export default routes
