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
    const { id, date_updated } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing account id." },
        { status: 400 }
      );
    }

    const updated = await Xchire_sql`
      UPDATE accounts SET
        status = 'Removed',
        date_updated = ${date_updated}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated[0] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating account status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update account status.",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
