import AuthController from '../controllers/auth'
import express from 'express'

const authRouter = express.Router()

authRouter.post('/signin', AuthController.signin)
authRouter.post('/signup', AuthController.signup)

export default authRouter
