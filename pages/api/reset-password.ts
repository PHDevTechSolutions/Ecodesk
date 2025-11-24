import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth"; // your password hashing function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required" });
  }

  const db = await connectToDatabase();
  const user = await db.collection("users").findOne({ Email: email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashedPassword = await hashPassword(newPassword);
  
  await db.collection("users").updateOne(
    { Email: email },
    {
      $set: {
        Password: hashedPassword,
        LoginAttempts: 0,
        Status: "Active",
        LockUntil: null,
      },
    }
  );

  return res.status(200).json({ message: "Password reset successful" });
}
