import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

function normalizeField(value: any): string {
  if (Array.isArray(value)) {
    const filtered = value.filter((v) => v && v.trim() !== "");
    return filtered.join(", ");
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received save account data:", body);

    const {
      referenceid,
      tsm,
      manager,
      companyname,
      contactperson,
      contactnumber,
      emailaddress,
      address,
      deliveryaddress,
      area,
      typeclient,
      date_created,
      status,
    } = body;

    if (!referenceid || !companyname || !typeclient) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: referenceid, companyname, or typeclient." },
        { status: 400 }
      );
    }

    // Normalize array or string fields
    const normalizedContactPerson = normalizeField(contactperson);
    const normalizedContactNumber = normalizeField(contactnumber);
    const normalizedEmailAddress = normalizeField(emailaddress);

    // Use current timestamp if date_created not provided or invalid
    const createdDate =
      date_created && !isNaN(Date.parse(date_created))
        ? date_created
        : new Date().toISOString();

    const inserted = await Xchire_sql`
      INSERT INTO accounts
      (
        referenceid,
        tsm,
        manager,
        companyname,
        contactperson,
        contactnumber,
        emailaddress,
        address,
        deliveryaddress,
        area,
        typeclient,
        date_created,
        status
      )
      VALUES
      (
        ${referenceid},
        ${tsm || null},
        ${manager || null},
        ${companyname},
        ${normalizedContactPerson || null},
        ${normalizedContactNumber || null},
        ${normalizedEmailAddress || null},
        ${address || null},
        ${deliveryaddress || null},
        ${area || null},
        ${typeclient},
        ${createdDate},
        ${status || "Active"}
      )
      RETURNING *;
    `;

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving account:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save account." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
