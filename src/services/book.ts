import {
  CollectionReference,
  DocumentData,
  Query,
  QuerySnapshot,
} from '@google-cloud/firestore'
import { Book, BookInfo, BookItem, NewBook } from 'types'

import AlgoliaClient from '../algolia/algoliaClient'
import FirestoreClient from '../firestore/firestoreClient'
import OrderServices from './order'

const bookCol = FirestoreClient.collection('books')
const ordersCol = FirestoreClient.collection('orders')
const bookIndex = AlgoliaClient.initIndex('books_index')

export interface GetBooksProps {
  showHidden: boolean
  startAt: number
  limit: number
}

export interface SearchBooksProps {
  showHidden: boolean
  startAt: number
  limit: number
  categories: string[]
  search: string
}

const dataToBook = (data: DocumentData, isbn: string): BookInfo => {
  return {
    isbn,
    title: data.title,
    author: data.author,
    publisher: data.publisher,
    description: data.description,
    categories: data.categories,
    isHidden: data.isHidden,
    items: data.items,
  }
}

const snapshotToBooks = (snapshot: QuerySnapshot): BookInfo[] => {
  return snapshot.docs.map((doc) => dataToBook(doc.data(), doc.id))
}

const search = async ({
  showHidden,
  startAt,
  limit,
  categories,
  search,
}: SearchBooksProps): Promise<{ books: BookInfo[]; totalCount: number }> => {
  const categoriesFilterStr = categories.length
    ? `categories:${categories.join(' AND categories:')}`
    : ''
  const isHiddenFilterStr = showHidden ? '' : 'isHidden:false'
  const filterStr = [categoriesFilterStr, isHiddenFilterStr]
    .filter((x) => x)
    .join(' AND ')
  const result = await bookIndex.search<BookInfo>(search, {
    filters: filterStr || undefined,
    offset: startAt,
    length: limit,
  })
  return { books: result.hits as BookInfo[], totalCount: result.nbHits }
}

const getAll = async ({ showHidden, startAt, limit }: GetBooksProps) => {
  let query: CollectionReference | Query = bookCol
  if (!showHidden) {
    query = bookCol.where('isHidden', '==', false)
  }
  query = query.orderBy('title')
  const totalCount = (await query.get()).size
  const first = (await query.limit(startAt + 1).get()).docs.pop()
  if (first) {
    query = query.startAt(first.data().title)
  }
  if (limit) {
    query = query.limit(limit)
  }
  const snapshot = await query.get()
  return { books: snapshotToBooks(snapshot), totalCount }
}

const getByISBN = async (isbn: string) => {
  const snapshot = await bookCol.doc(isbn).get()
  const data = snapshot.data()
  if (data) {
    return dataToBook(data, isbn)
  } else {
    throw new Error(`No book with ISBN: ${isbn} found`)
  }
}

const update = async (
  isbn: string,
  newBook: Partial<Book>,
): Promise<BookInfo> => {
  const bookRef = bookCol.doc(isbn)
  const existingBook = await bookRef.get()
  const bookData = existingBook.data()
  if (!bookData) {
    throw new Error(`Book with ISBN: ${isbn} doesn't exist`)
  }
  const batch = FirestoreClient.batch()
  const oldBook = dataToBook(bookData, isbn)
  const authorIsNew = newBook.author && newBook.author !== oldBook.author
  const titleIsNew = newBook.title && newBook.title !== oldBook.title
  if (authorIsNew || titleIsNew) {
    const snap = await ordersCol.where('isbns', 'array-contains', isbn).get()
    const orders = OrderServices.snapshotToOrders(snap)
    orders.forEach((order) => {
      batch.update(ordersCol.doc(order.id), {
        items: order.items.map((item) => ({
          ...item,
          author: authorIsNew ? newBook.author : item.author,
          title: titleIsNew ? newBook.title : item.title,
        })),
      })
    })
  }
  batch.update(bookRef, newBook)
  const res: BookInfo = {
    ...dataToBook(bookData, isbn),
    ...newBook,
  }
  await batch.commit()
  await bookIndex.saveObject({ ...res, objectID: isbn })
  return res
}

const create = async (newBook: NewBook) => {
  const book: BookInfo = {
    isbn: newBook.isbn,
    title: newBook.title,
    author: newBook.author,
    publisher: newBook.publisher,
    description: newBook.description,
    categories: newBook.categories,
    isHidden: newBook.isHidden,
    items: [],
  }
  const bookRef = bookCol.doc(book.isbn)
  const existingBook = await bookRef.get()
  if (existingBook.data()) {
    throw new Error(`Book with ISBN: ${book.isbn} exists`)
  }
  for (let i = 0; i < newBook.itemCount; i += 1) {
    const bookItem: BookItem = {
      id: `${newBook.isbn}_${i}`,
      isbn: newBook.isbn,
      ordered: false,
    }
    book.items.push(bookItem)
  }
  bookRef.set(book, { merge: true })
  await bookIndex.saveObject({ ...book, objectID: book.isbn })
  return book
}

const BookServices = {
  getAll,
  getByISBN,
  create,
  update,
  dataToBook,
  snapshotToBooks,
  search,
}

export default BookServices
