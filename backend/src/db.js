const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer = null;

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      console.warn(`MongoDB connection failed: ${error.message}`);
    }
  }

  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log("Connected to in-memory MongoDB");
}

async function stopDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = { connectDB, stopDB };
