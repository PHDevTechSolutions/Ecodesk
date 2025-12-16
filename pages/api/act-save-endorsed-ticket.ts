import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  if (!body || Object.keys(body).length === 0) return res.status(400).json({ error: "No data provided" });

  const insertData: Record<string, any> = {};
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      insertData[key] = value;
    }
  });

  console.log("Inserting into Supabase:", insertData);

  const { error } = await supabase.from("endorsed-ticket").insert([insertData]);

  if (error) {
    console.error("Insert failed:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
