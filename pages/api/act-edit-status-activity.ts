import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { activity_reference_number, status } = req.body;

  if (!activity_reference_number) {
    return res.status(400).json({ error: "Missing activity_reference_number" });
  }

  if (!status) {
    return res.status(400).json({ error: "Missing status" });
  }

  try {
    const { data, error } = await supabase
      .from("activity")
      .update({
        status,
        date_updated: new Date().toISOString(),
      })
      .eq("activity_reference_number", activity_reference_number)
      .select();

    if (error) {
      console.error("Supabase Update Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
}
