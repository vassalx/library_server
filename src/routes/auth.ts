import AuthController from '../controllers/auth'
import express from 'express'

const authRouter = express.Router()

authRouter.post('/signin', AuthController.signin)
authRouter.post('/signup', AuthController.signup)
authRouter.get('/signout', AuthController.signout)

export default authRouter
