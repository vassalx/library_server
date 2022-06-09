import { DocumentData, QuerySnapshot } from '@google-cloud/firestore'
import FirestoreClient from '../firestore/firestoreClient'
import { NewUser, UserInfo } from 'types'

const userCol = FirestoreClient.collection('users')

const dataToUser = (data: DocumentData, email: string): UserInfo => {
  return {
    email,
    password: data.password,
    role: data.role,
    orders: data.orders,
    address: data.address,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
  }
}

const qureyToUsers = (snapshot: QuerySnapshot): UserInfo[] => {
  return snapshot.docs.map((doc) => {
    const email = doc.id
    const data = doc.data()
    return {
      email,
      role: data.role,
      password: data.password,
      orders: data.orders,
      address: data.address,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
    }
  })
}

const getAll = async () => {
  const res = await userCol.orderBy('email').get()
  return qureyToUsers(res)
}

const getByEmail = async (email: string) => {
  const res = await userCol.doc(email).get()
  const data = res.data()
  return data ? dataToUser(data, email) : undefined
}

const create = async (newUser: NewUser): Promise<UserInfo> => {
  const user: UserInfo = {
    ...newUser,
    orders: [],
    role: 'USER',
  }
  await userCol.doc(newUser.email).set(user, { merge: true })
  return user
}

const UserServices = {
  getAll,
  getByEmail,
  create,
}

export default UserServices
