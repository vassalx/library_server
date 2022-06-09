import express from 'express'
import BookController from '../controllers/book'
import authenticateJWT from '../middleware/authenticateJwt'
import roleCheck from '../middleware/roleCheck'

const bookRouter = express.Router()

bookRouter.get('/', [authenticateJWT, roleCheck(['ADMIN', 'USER'])], BookController.getAll)
bookRouter.get('/:isbn', [authenticateJWT, roleCheck(['ADMIN', 'USER'])], BookController.getAll)
bookRouter.post('/', [authenticateJWT, roleCheck(['ADMIN'])], BookController.create)
bookRouter.post('/:isbn', [authenticateJWT, roleCheck(['ADMIN'])], BookController.update)

export default bookRouter
