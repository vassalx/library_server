import { NextFunction, Request, Response } from 'express'
import { Role } from 'types'

const roleCheck = (roles: Role[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.user) {
      return res.sendStatus(401)
    }
    const { role } = res.locals.user
    if (!role) {
      return res.sendStatus(401)
    }
    if (!roles.includes(role)) {
      return res.sendStatus(403)
    }
    next()
  }
}

export default roleCheck
