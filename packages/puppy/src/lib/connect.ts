import * as mongoose from 'mongoose'

interface IMongoDBOptions {
  readonly database: string
}

export const connectMongoDB = async (opts: IMongoDBOptions) => {
  const mongo_dsn =
    process.env.NODE_ENV === 'development'
      ? `mongodb://localhost:27017/${opts.database}-dev`
      : process.env.MONGO_DSN!

  try {
    await mongoose.connect(mongo_dsn)
  } catch (err) {
    console.log(`Wrong MongoDB string, could not be accessed.\n${err}`)
  }
}
