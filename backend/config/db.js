import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/erenthub";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB Compass] You can view your database in MongoDB Compass at: ${uri}`);
    console.log(`[MongoDB Compass] Database Name: erenthub`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.log(`[MongoDB Compass Tip] Ensure MongoDB Server is running or check the connection string: ${uri}`);
    return null;
  }
}

