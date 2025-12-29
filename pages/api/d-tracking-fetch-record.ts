import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
}

const mongoUri: string = MONGODB_URI;
const mongoDb: string = MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient["db"]> | null = null;

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
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { referenceid } = req.query;

    // Build filter based on referenceid if provided and valid
    const filter: Record<string, any> = {};
    if (referenceid && typeof referenceid === "string" && referenceid.trim() !== "") {
      filter.referenceid = referenceid;
    }

    const { db } = await connectToDatabase();
    const collection = db.collection("d-tracking");

    const data = await collection.find(filter).sort({ date_created: -1 }).toArray();

    return res.status(200).json({ success: true, data, cached: false });
  } catch (error) {
    console.error("MongoDB fetch error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
