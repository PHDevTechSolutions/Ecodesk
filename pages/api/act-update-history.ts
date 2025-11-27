import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  const body = req.body;

  // Remove empty or null fields para hindi mag-overwrite ng blank values
  const updateData: Record<string, any> = {};
  Object.entries(body).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      updateData[key] = value;
    }
  });

  // Update sa Supabase
  const { error } = await supabase
    .from("history")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Update failed:", error);
    return res.status(500).json({ error: "Failed to update history." });
  }

  return res.status(200).json({ success: true });
}
