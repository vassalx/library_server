import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import UserServices from '../services/user'

const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, address, fullName, dateOfBirth } = req.body
    const user = await UserServices.getByEmail(email)
    if (user) {
      return res.status(400).send('User with this email already exists.')
    }
    await UserServices.create({
      password: bcrypt.hashSync(password, 8),
      email,
      address,
      fullName,
      dateOfBirth,
    })
    return res.status(200).send('User registered successfully!')
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const signin = async (req: Request, res: Response) => {
  try {
    const user = await UserServices.getByEmail(req.body.email)
    if (!user) {
      return res.status(404).send('User Not found.')
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
    if (!passwordIsValid) {
      return res.status(401).send('Invalid Password!')
    }
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: 86400, // 24 hours
      },
    )
    if (!req.session) {
      req.session = { token }
    } else {
      req.session.token = token
    }
    return res.status(200).send(user)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const signout = async (req: Request, res: Response) => {
  if (req.session) {
    req.session.token = null
  }
  res.status(200).json('User signed out successfully')
}

const AuthController = {
  signup,
  signin,
  signout,
}

export default AuthController
