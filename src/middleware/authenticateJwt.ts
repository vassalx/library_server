import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: string = req.headers['x-access-token'] || req.headers.authorization || req.body.token

  if (authHeader) {
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }
      if (user) {
        res.locals.user = user
      }
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

export default authenticateJWT
