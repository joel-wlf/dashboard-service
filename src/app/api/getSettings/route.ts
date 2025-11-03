import { NextResponse } from "next/server";

export async function GET() {
  const username = process.env.DB_USERNAME || "admin";
  const password = process.env.DB_PASSWORD || "password";

  const res = await fetch("http://localhost:5984/dashboardconfig/_all_docs?include_docs=true", {
    headers: {
      Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: `CouchDB error ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data.rows.map((r: any) => r.doc));
}
