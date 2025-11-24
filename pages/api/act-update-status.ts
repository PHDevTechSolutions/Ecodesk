import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { activityReferenceNumber } = req.body;

    console.log("Request body:", req.body);

    if (!activityReferenceNumber || typeof activityReferenceNumber !== "string") {
      return res.status(400).json({ error: "Invalid activity reference number" });
    }

    // Update status from "On-Progress" to "Done"
    const { data, error } = await supabase
      .from("activity")
      .update({ status: "Done" })
      .eq("activity_reference_number", activityReferenceNumber)
      .eq("status", "On-Progress")
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      // No rows updated means either ID not found or already done
      return res.status(404).json({ error: "Activity not found or already done" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
