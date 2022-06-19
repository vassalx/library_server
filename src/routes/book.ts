import express from 'express'

import BookController from '../controllers/book'
import authenticateJWT from '../middleware/authenticateJwt'
import roleCheck from '../middleware/roleCheck'

const bookRouter = express.Router()

bookRouter.get(
  '/:isbn',
  [authenticateJWT, roleCheck(['ADMIN', 'USER'])],
  BookController.getByISBN,
)
bookRouter.get(
  '/',
  [authenticateJWT, roleCheck(['ADMIN', 'USER'])],
  BookController.getAll,
)
bookRouter.post(
  '/:isbn',
  [authenticateJWT, roleCheck(['ADMIN'])],
  BookController.update,
)
bookRouter.post(
  '/',
  [authenticateJWT, roleCheck(['ADMIN'])],
  BookController.create,
)

export default bookRouter
