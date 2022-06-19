import express from 'express'

import AuthController from '../controllers/auth'

const authRouter = express.Router()

authRouter.post('/signin', AuthController.signin)
authRouter.post('/signup', AuthController.signup)
authRouter.get('/signout', AuthController.signout)

export default authRouter
