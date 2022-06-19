export type Role = 'USER' | 'ADMIN'
export type OrderStatus =
  | 'PENDING'
  | 'READY'
  | 'RECIEVED'
  | 'RETURNED'
  | 'CANCELED'

export interface NewUser {
  email: string
  password: string
  address: string
  fullName: string
  dateOfBirth: string
}

export interface User extends NewUser {
  role: Role
}

export interface Book {
  isbn: string
  title: string
  author: string
  publisher: string
  description: string
  categories: string[]
  isHidden: boolean
}

export interface BookItem {
  id: string
  isbn: string
  ordered: boolean
}

export interface NewBook extends Book {
  itemCount: number
}

export interface BookInfo extends Book {
  items: BookItem[]
}

export interface OrderItem {
  id: string
  isbn: string
  author: string
  title: string
}

export interface NewOrder {
  userId: string
  userFullName: string
  userEmail: string
  items: OrderItem[]
  dateToReturn: string
}

export interface Order extends NewOrder {
  id: string
  isbns: string[]
  status: OrderStatus
  dateOrdered: string
  dateReceived?: string
  dateReturned?: string
}
