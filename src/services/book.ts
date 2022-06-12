import {
  CollectionReference,
  DocumentData,
  Query,
  QuerySnapshot,
} from '@google-cloud/firestore'
import FirestoreClient from '../firestore/firestoreClient'
import { NewBook, BookInfo, BookItem, Book } from 'types'

const bookCol = FirestoreClient.collection('books')
const bookItemCol = FirestoreClient.collection('bookItems')

export interface GetBooksProps {
  showHidden: boolean
  startAt: number
  limit: number
  categories: string[]
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

const getAll = async ({
  showHidden,
  startAt,
  limit,
  categories,
}: GetBooksProps) => {
  let query: CollectionReference | Query = bookCol.orderBy('title')
  if (!showHidden) {
    query = bookCol.where('isHidden', '==', false)
  }
  if (categories.length > 0) {
    query = query.where('categories', 'array-contains-any', categories)
  }
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
  await bookCol.doc(isbn).update(newBook)
  const res = {
    ...dataToBook(bookData, isbn),
    ...newBook,
  }
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
  const batch = FirestoreClient.batch()
  batch.set(bookRef, book, { merge: true })
  for (let i = 0; i < newBook.itemCount; i += 1) {
    const bookItem: BookItem = {
      isbn: newBook.isbn,
      ordered: false,
    }
    book.items.push(bookItem)
    batch.set(bookItemCol.doc(), bookItem)
    batch.set(bookRef.collection('items').doc(), bookItem, { merge: true })
  }
  batch.commit()
  return book
}

const BookServices = {
  getAll,
  getByISBN,
  create,
  update,
}

export default BookServices
