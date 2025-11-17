import { NextRequest, NextResponse } from "next/server";

// Hardcoded API key for authentication
const API_KEY = "TestBedJSMKey";

export async function GET(request: NextRequest) {
  try {
    // Check for API key in headers
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    // Get CouchDB configuration from environment
    const couchdbUrl = process.env.DB_URL || "http://localhost:5984/";
    const couchdbUsername = process.env.DB_USERNAME || "admin";
    const couchdbPassword = process.env.DB_PASSWORD || "admin_password";
    const couchdbDatabase = "dashboardconfig";

    // Create CouchDB auth header
    const auth = Buffer.from(`${couchdbUsername}:${couchdbPassword}`).toString('base64');

    // Query testbed info from CouchDB
    const response = await fetch(`${couchdbUrl}/${couchdbDatabase}/_find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        selector: {
          key: "testbed_info"
        },
        limit: 1
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from database" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // Return testbed data if found
    if (data.docs && data.docs.length > 0) {
      const testbedData = data.docs[0].value || [];
      
      return NextResponse.json({
        success: true,
        data: testbedData,
        count: testbedData.length,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: "No testbed data found",
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error fetching testbed info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add support for query parameters
export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey || apiKey !== API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filter } = body;

    // Get CouchDB configuration
    const couchdbUrl = process.env.DB_URL || "http://localhost:5984/";
    const couchdbUsername = process.env.DB_USERNAME || "admin";
    const couchdbPassword = process.env.DB_PASSWORD || "admin_password";
    const couchdbDatabase = "dashboardconfig";

    const auth = Buffer.from(`${couchdbUsername}:${couchdbPassword}`).toString('base64');

    // Query with custom filter
    const response = await fetch(`${couchdbUrl}/${couchdbDatabase}/_find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        selector: {
          key: "testbed_info"
        },
        limit: 1
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from database" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.docs && data.docs.length > 0) {
      let testbedData = data.docs[0].value || [];
      
      // Apply filter if provided
      if (filter) {
        testbedData = testbedData.filter((item) => {
          return Object.entries(filter).every(([key, value]) => {
            return item[key] === value;
          });
        });
      }
      
      return NextResponse.json({
        success: true,
        data: testbedData,
        count: testbedData.length,
        filter: filter || null,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: "No testbed data found",
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error("Error fetching testbed info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}