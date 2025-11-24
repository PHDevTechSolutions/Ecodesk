// pages/api/act-save-account.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../utils/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const {
            referenceid,
            tsm,
            manager,
            account_reference_number,
            status,
            activity_reference_number,
        } = req.body;

        if (!referenceid || !tsm || !manager || !account_reference_number || !status || !activity_reference_number) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Insert to Supabase table
        const { data, error } = await supabase
            .from("activity")
            .insert({
                referenceid,
                tsm,
                manager,
                account_reference_number,
                status,
                activity_reference_number,
            });

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (err: any) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
