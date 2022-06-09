import { Router } from 'express'
import authRouter from './auth'
import bookRouter from './book'

const routes = Router()

routes.use('/book', bookRouter)
routes.use('/auth', authRouter)

export default routes
