// app/api/get-account-references/route.ts (Next.js App Router style)
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix");

    if (!prefix || prefix.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Missing 'prefix' query parameter" },
        { status: 400 }
      );
    }

    // Query to find all account_reference_number starting with prefix (case insensitive)
    const queryPrefix = prefix.toUpperCase() + "%"; // e.g. RE-CSR-%
    const accounts = await Xchire_sql`
      SELECT account_reference_number
      FROM accounts
      WHERE UPPER(account_reference_number) LIKE ${queryPrefix}
      ORDER BY account_reference_number ASC;
    `;

    if (accounts.length === 0) {
      return NextResponse.json(
        { success: true, references: [] },
        { status: 200 }
      );
    }

    // Extract account_reference_number only
    const references = accounts.map((row) => row.account_reference_number);

    return NextResponse.json(
      { success: true, references },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching account references:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch account references" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
