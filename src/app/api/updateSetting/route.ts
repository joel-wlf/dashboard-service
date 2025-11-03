import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { key, value } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const username = process.env.DB_USERNAME || "admin";
  const password = process.env.DB_PASSWORD || "password";
  const auth =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  // 1. Find the document with this key
  const findRes = await fetch("http://localhost:5984/dashboardconfig/_find", {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      selector: { key },
      limit: 1,
    }),
  });

  if (!findRes.ok) {
    return NextResponse.json(
      { error: `CouchDB find error ${findRes.status}` },
      { status: findRes.status }
    );
  }

  const findData = await findRes.json();
  const doc = findData.docs?.[0];

  if (!doc) {
    return NextResponse.json(
      { error: `No document found for key '${key}'` },
      { status: 404 }
    );
  }

  // 2. Update and save the document
  const updatedDoc = { ...doc, value };

  const updateRes = await fetch(
    `http://localhost:5984/dashboardconfig/${doc._id}`,
    {
      method: "PUT",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDoc),
    }
  );

  if (!updateRes.ok) {
    return NextResponse.json(
      { error: `CouchDB update error ${updateRes.status}` },
      { status: updateRes.status }
    );
  }

  const result = await updateRes.json();
  return NextResponse.json({ success: true, result });
}
