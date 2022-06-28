import { Request, Response } from 'express'
import { Book } from 'types'

import BookServices from '../services/book'

const getAll = async (req: Request, res: Response) => {
  const { role } = res.locals.user
  const search = req.query.search as string
  const startAt = Number(req.query.startAt as string)
  const limit = Number(req.query.limit as string)
  const categories = req.query.categories
    ? (req.query.categories as string).split(';')
    : []
  const showHidden = role === 'ADMIN'
  try {
    const result = await (search || categories.length
      ? BookServices.search({
          showHidden,
          startAt,
          limit,
          search,
          categories,
        })
      : BookServices.getAll({
          showHidden,
          startAt,
          limit,
        }))
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
  const newBook = req.body as Partial<Book>
  Object.keys(newBook).forEach((key) =>
    newBook[key as keyof Book] === undefined
      ? delete newBook[key as keyof Book]
      : {},
  )
  try {
    const book = await BookServices.update(isbn, newBook)
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
