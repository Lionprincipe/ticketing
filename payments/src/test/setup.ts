import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

declare global {
  namespace NodeJS {
    interface Global {
      signup(id?: string): string[]
    }
  }
}

jest.mock('../nats-wrapper')

let mongo: any
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfadfssds'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri()

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongo.stop()
  await mongoose.connection.close()
})

global.signup = (id?: string) => {
  //build a JWT payload . {id, email}
  id = id || new mongoose.Types.ObjectId().toHexString()
  const payload = {
    id,
    email: 'test@test.com',
  }
  //create JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!)
  //build session object.{jwt:My_JWT}&& turn sessison into JSON
  const sessionJSON = JSON.stringify({ jwt: token })
  //take JSON encode it to base64 and return the string
  return [`express:sess=${Buffer.from(sessionJSON).toString('base64')}`]
}
