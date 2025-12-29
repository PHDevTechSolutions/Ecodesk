import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

/* 🔒 Runtime env checks */
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");
if (!MONGODB_DB) throw new Error("Please define MONGODB_DB in .env.local");

const mongoUri: string = MONGODB_URI;
const mongoDb: string = MONGODB_DB;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(mongoDb);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "Record ID is required." });

    const { db } = await connectToDatabase();
    const collection = db.collection("d-tracking");

    // 🔹 Only set isActive to false
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "PO record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "PO record is now inactive",
      updatedRecord: { _id: id, isActive: false },
    });
  } catch (error: any) {
    console.error("Error hiding PO record:", error);
    return res.status(500).json({ error: error.message || "Failed to hide PO record" });
  }
}
