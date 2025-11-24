import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const TASKFLOW_DB_URL = process.env.TASKFLOW_DB_URL;
if (!TASKFLOW_DB_URL) {
  throw new Error("TASKFLOW_DB_URL is not set in environment variables.");
}

const sql = neon(TASKFLOW_DB_URL);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyNameRaw = url.searchParams.get("company_name");

    if (!companyNameRaw || companyNameRaw.trim().length < 3) {
      return NextResponse.json(
        { exists: false, companies: [], error: "Invalid or missing company_name." },
        { status: 400 }
      );
    }

    // Clean the input similarly to your client-side cleanCompanyName function
    let cleaned = companyNameRaw.toUpperCase();
    cleaned = cleaned.replace(/[-_.]/g, "");
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    cleaned = cleaned.replace(/\d+$/g, "");
    cleaned = cleaned.trim();

    // Use ILIKE with % cleaned % to find possible duplicates (case-insensitive)
    // This is a simple fuzzy approach on DB side, more advanced fuzzy search can be added via extension
    const results = await sql`
      SELECT company_name, referenceid AS owner_referenceid
      FROM accounts
      WHERE company_name ILIKE ${`%${cleaned}%`}
      LIMIT 10;
    `;

    if (results.length === 0) {
      return NextResponse.json({ exists: false, companies: [] }, { status: 200 });
    }

    return NextResponse.json({ exists: true, companies: results }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/accounts/check-duplicate:", error);
    return NextResponse.json(
      { exists: false, companies: [], error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
