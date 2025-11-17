import { NextResponse } from "next/server";


export async function GET() {
  const username = process.env.DB_USERNAME || "admin";
  const password = process.env.DB_PASSWORD || "admin_password";

  const dbUrl = process.env.DB_URL || "http://localhost:5984/";
  const res = await fetch(`${dbUrl}dashboardconfig/_all_docs?include_docs=true`, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `CouchDB error ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data.rows.map((r) => r.doc));
}
