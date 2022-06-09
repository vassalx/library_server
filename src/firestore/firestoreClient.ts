import { Firestore } from '@google-cloud/firestore'

const FirestoreClient = new Firestore({
  projectId: 'library2022',
  keyFilename: './src/firestore/service-account.json'
})

export default FirestoreClient
