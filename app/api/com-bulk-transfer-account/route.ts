import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { ids, status, newReferenceId } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "IDs array is required and cannot be empty." },
        { status: 400 }
      );
    }

    if (typeof status !== "string" || !status.trim()) {
      return NextResponse.json(
        { success: false, error: "Status is required." },
        { status: 400 }
      );
    }

    if (typeof newReferenceId !== "string" || !newReferenceId.trim()) {
      return NextResponse.json(
        { success: false, error: "newReferenceId is required." },
        { status: 400 }
      );
    }

    // Build parameterized SQL for updating multiple accounts by their ids
    // We use the PostgreSQL ANY() with array syntax to update all at once
    const updateResult = await Xchire_sql`
      UPDATE accounts
      SET status = ${status}, referenceid = ${newReferenceId}, date_transferred = NOW()
      WHERE id = ANY(${ids});
    `;

    // Note: neon currently returns empty object for UPDATE, no matchedCount info
    // So, we can either trust query success or run a select afterward to confirm if needed.

    return NextResponse.json(
      { success: true, message: "Accounts transferred successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error transferring accounts:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error transferring accounts" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
