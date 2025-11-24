import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const db = await connectToDatabase();
  const user = await db.collection("users").findOne({ Email: email });

  if (!user) {
    return res.status(404).json({ message: "Email not found" });
  }

  return res.status(200).json({ message: "Email found" });
}
