import {
  DocumentData,
  QuerySnapshot,
  Query,
  CollectionReference,
} from '@google-cloud/firestore'
import FirestoreClient from '../firestore/firestoreClient'
import { NewOrder, Order, OrderStatus } from 'types'
import BookServices from './book'

const ordersCol = FirestoreClient.collection('orders')
const booksCol = FirestoreClient.collection('books')

export interface GetOrderProps {
  startAt: number
  limit: number
  userId?: string
  search?: string
}

const dataToOrder = (data: DocumentData): Order => {
  return {
    id: data.id,
    userId: data.userId,
    userFullName: data.userFullName,
    userEmail: data.userEmail,
    items: data.items,
    status: data.status,
    dateToReturn: data.dateToReturn,
    dateOrdered: data.dateOrdered,
    dateReceived: data.dateReceived,
    dateReturned: data.dateReturned,
    isbns: data.isbns,
  }
}

const snapshotToOrders = (snapshot: QuerySnapshot): Order[] => {
  return snapshot.docs.map((doc) => dataToOrder(doc.data()))
}

const create = async (newOrder: NewOrder): Promise<Order> => {
  const orderRef = ordersCol.doc()
  const order: Order = {
    ...newOrder,
    id: orderRef.id,
    isbns: newOrder.items.map((item) => item.isbn),
    dateOrdered: new Date().toISOString(),
    status: 'PENDING',
  }
  orderRef.set(order)
  return order
}

const isOrdered = (status: OrderStatus) => {
  return status === 'PENDING' || status === 'READY' || status === 'RECIEVED'
}

const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
  const orderRef = ordersCol.doc(orderId)
  const orderData = (await orderRef.get()).data()
  if (!orderData) {
    throw new Error(`Order with id: ${orderId} doesn't exist`)
  }
  const batch = FirestoreClient.batch()
  const order = dataToOrder(orderData)
  const updateData: Partial<Order> = { status: newStatus }
  const itemIds = order.items.map((item) => item.id)
  const oldOrdered = isOrdered(order.status)
  const newOrdered = isOrdered(newStatus)
  const newOrder: Order = { ...order, status: newStatus }
  if (oldOrdered !== newOrdered) {
    const snap = await booksCol.where('isbn', 'in', order.isbns).get()
    const books = BookServices.snapshotToBooks(snap)
    books.forEach((book) => {
      batch.update(booksCol.doc(book.isbn), {
        items: book.items.map((item) => ({
          ...item,
          ordered: itemIds.indexOf(item.id) >= 0 ? newOrdered : item.ordered,
        })),
      })
    })
  }
  if (newStatus === 'RECIEVED') {
    updateData.dateReceived = new Date().toISOString()
  }
  if (newStatus === 'CANCELED' || newStatus === 'RETURNED') {
    updateData.dateReturned = new Date().toISOString()
  }
  batch.update(orderRef, updateData)
  await batch.commit()
  return newOrder
}

const getAll = async ({ userId, limit, startAt, search }: GetOrderProps) => {
  let query: CollectionReference | Query = ordersCol

  if (userId) {
    query = query.where('userId', '==', userId)
  }
  if (search && search.length) {
    query = query.where('id', '>=', search).where('id', '<=', search + '~')
  }
  query = query.orderBy('dateOrdered')
  const totalCount = (await query.get()).size
  const first = (await query.limit(startAt + 1).get()).docs.pop()
  if (first) {
    query = query.startAt(first.data().title)
  }
  if (limit) {
    query = query.limit(limit)
  }
  const snapshot = await query.get()
  return { orders: snapshotToOrders(snapshot), totalCount }
}

const OrderServices = {
  create,
  getAll,
  dataToOrder,
  snapshotToOrders,
  updateOrderStatus,
}

export default OrderServices
