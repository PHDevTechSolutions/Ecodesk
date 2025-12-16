import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Runtime check for env vars
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
}

const mongoUri: string = MONGODB_URI;
const mongoDb: string = MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(mongoDb);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body;

    // Add timestamps
    const payload = {
      ...body,
      date_created: new Date().toISOString(),
      date_updated: new Date().toISOString(),
    };

    const { db } = await connectToDatabase();
    const collection = db.collection("activity");

    const result = await collection.insertOne(payload);

    return res.status(200).json({ success: true, insertedId: result.insertedId });
  } catch (error: any) {
    console.error("MongoDB insert error:", error);
    return res.status(500).json({ error: error.message || "Failed to save activity" });
  }
}
