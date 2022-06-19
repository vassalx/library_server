import { DocumentData, QuerySnapshot } from '@google-cloud/firestore'
import FirestoreClient from '../firestore/firestoreClient'
import { NewUser, User } from 'types'

const userCol = FirestoreClient.collection('users')

const dataToUser = (data: DocumentData, email: string): User => {
  return {
    email,
    password: data.password,
    role: data.role,
    address: data.address,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
  }
}

const qureyToUsers = (snapshot: QuerySnapshot): User[] => {
  return snapshot.docs.map((doc) => dataToUser(doc.data(), doc.id))
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

const create = async (newUser: NewUser): Promise<User> => {
  const user: User = {
    ...newUser,
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
