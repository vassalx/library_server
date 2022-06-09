import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.session?.token
  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      })
    }
    res.locals.user = user
    next()
  })
}

export default authenticateJWT
