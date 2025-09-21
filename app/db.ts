import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URL as string;
if (!uri) {
  throw new Error("MONGO_URL environment variable is not set");
}
const dbName = "snake";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db; // Reuse existing connection

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("MongoDB connected");
  }

  db = client.db(dbName);
  return db;
}

// Optional: close connection gracefully (for app shutdown)
export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed");
  }
}
