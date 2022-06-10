import { Request, Response } from 'express'
import BookServices from '../services/book'

const getAll = async (req: Request, res: Response) => {
  const { role } = res.locals.user
  const startAt = Number(req.query.startAt as string)
  const limit = Number(req.query.limit as string)
  const categories = req.query.categories
    ? (req.query.categories as string).split(';')
    : []
  const showHidden = role === 'ADMIN'
  try {
    const books = await BookServices.getAll({
      showHidden,
      startAt,
      limit,
      categories,
    })
    return res.status(200).send(books)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const getByISBN = async (req: Request, res: Response) => {
  const isbn = req.params.isbn
  try {
    const book = await BookServices.getByISBN(isbn)
    return res.status(200).send(book)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const create = async (req: Request, res: Response) => {
  const { isbn, name, author, publisher, categories, isHidden, itemCount } =
    req.body
  try {
    const book = await BookServices.create({
      isbn,
      name,
      author,
      publisher,
      categories,
      isHidden,
      itemCount,
    })
    return res.status(200).send(book)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const update = async (req: Request, res: Response) => {
  const isbn = req.params.isbn
  const { name, author, publisher, categories, isHidden } = req.body
  try {
    const book = await BookServices.update(isbn, {
      name,
      author,
      publisher,
      categories,
      isHidden,
    })
    return res.status(200).send(book)
  } catch (error: any) {
    return res.status(500).send(error.message)
  }
}

const BookController = {
  getAll,
  getByISBN,
  create,
  update,
}

export default BookController
