const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
}

async function stopDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, stopDB };
