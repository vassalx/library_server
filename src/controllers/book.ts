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
    const result = await BookServices.getAll({
      showHidden,
      startAt,
      limit,
      categories,
    })
    return res.status(200).send(result)
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
  const {
    isbn,
    title,
    author,
    publisher,
    description,
    categories,
    isHidden,
    itemCount,
  } = req.body
  try {
    const book = await BookServices.create({
      isbn,
      title,
      author,
      publisher,
      description,
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
  const { title, author, publisher, description, categories, isHidden } =
    req.body
  try {
    const book = await BookServices.update(isbn, {
      title,
      author,
      publisher,
      description,
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
