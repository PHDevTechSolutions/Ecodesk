import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const Xchire_databaseUrl = process.env.TASKFLOW_DB_URL;
if (!Xchire_databaseUrl) {
  throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}
const Xchire_sql = neon(Xchire_databaseUrl);

function normalizeFieldToArray(value: any): string[] {
  if (Array.isArray(value)) {
    return value.filter(v => typeof v === "string" && v.trim() !== "").map(v => v.trim());
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(v => typeof v === "string" && v.trim() !== "").map(v => v.trim());
      }
    } catch {
      return value.split(",").map(v => v.trim()).filter(v => v !== "");
    }
  }
  return [];
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      referenceid,
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

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing account id." }, { status: 400 });
    }

    const contactPersonArray = normalizeFieldToArray(contactperson);
    const contactNumberArray = normalizeFieldToArray(contactnumber);
    const emailAddressArray = normalizeFieldToArray(emailaddress);

    const updated = await Xchire_sql`
      UPDATE accounts SET
        referenceid = ${referenceid},
        companyname = ${companyname},
        contactperson = ${contactPersonArray},
        contactnumber = ${contactNumberArray},
        emailaddress = ${emailAddressArray},
        address = ${address},
        deliveryaddress = ${deliveryaddress},
        area = ${area},
        typeclient = ${typeclient},
        date_created = ${date_created},
        status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update account." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
