export type Role = 'USER' | 'ADMIN'

export interface NewUser {
  email: string,
  password: string,
  address: string,
  fullName: string,
  dateOfBirth: string,
}

export interface User extends NewUser {
  role: Role,
}

export interface Book {
  isbn: string,
  name: string,
  author: string,
  publisher: string,
  categories: string[],
  isHidden: boolean,
}

export interface BookItem {
  isbn: string,
  ordered: boolean,
}

export interface NewBook extends Book {
  itemCount: number,
}

export interface BookInfo extends Book {
  items: BookItem[],
}

export interface NewOrder {
  userId: string,
  isbn: string,
  bookItemId: string,
}

export interface Order extends NewOrder {
  datePickedUp: string,
  dateDue: string,
  dateReturned: string,
  dateOrdered: string,
}

export interface OrderForUser extends Order {
  book: Book,
  item: BookItem,
}

export interface OrderInfo extends OrderForUser {
  user: User,
}

export interface UserInfo extends User {
  orders: OrderForUser[],
}
