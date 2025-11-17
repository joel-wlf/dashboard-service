# Testbed Info API Documentation

## Übersicht

Diese API ermöglicht es, Testbed-Informationen aus der CouchDB-Datenbank abzurufen. Der Zugriff erfolgt über einen hardcodierten API-Key für die Authentifizierung.

## Authentifizierung

- **Methode**: Bearer Token
- **API Key**: `TestBedInfoJSMKey`
- **Header**: `Authorization: Bearer TestBedInfoJSMKey`

## Endpoints

### 1. GET /api/testbed-info

Ruft alle Testbed-Daten aus der Datenbank ab.

#### Request

```http
GET /api/testbed-info
Authorization: Bearer TestBedJSMKey
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "testbedId": 1,
      "name": "TestBed 1",
      "enabled": true,
      "servers": [
        {
          "ort": "1.1",
          "gruppe": "Samuel, Jonas"
        },
        {
          "ort": "1.2",
          "gruppe": "Lea, Mia"
        }
      ]
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T14:30:00.123Z"
}
```

#### Beispiel mit cURL

```bash
curl -X GET "http://localhost:3000/api/testbed-info" \
  -H "Authorization: Bearer TestBedInfoJSMKey"
```

### 2. POST /api/testbed-info

Ruft Testbed-Daten mit optionalen Filtern ab.

#### Request

```http
POST /api/testbed-info
Authorization: Bearer TestBedJSMKey
Content-Type: application/json

{
  "filter": {
    "status": "active"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "testbedId": 1,
      "name": "TestBed 1",
      "enabled": true,
      "servers": [
        {
          "ort": "1.1",
          "gruppe": "Samuel, Jonas"
        }
      ]
    }
  ],
  "count": 1,
  "filter": {
    "enabled": true
  },
  "timestamp": "2024-01-15T14:30:00.123Z"
}
```

#### Beispiel mit cURL

```bash
curl -X POST "http://localhost:3000/api/testbed-info" \
  -H "Authorization: Bearer TestBedInfoJSMKey" \
  -H "Content-Type: application/json" \
  -d '{"filter": {"enabled": true}}'
```

## Response Format

### Erfolgreiche Antwort

```json
{
  "success": true,
  "data": Array,        // Array der Testbed-Daten
  "count": Number,      // Anzahl der zurückgegebenen Elemente
  "filter": Object,     // Angewandter Filter (nur bei POST)
  "timestamp": String   // ISO-Zeitstempel der Antwort
}
```

### Fehler-Antworten

#### 401 Unauthorized

```json
{
  "error": "Unauthorized - Invalid API key"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

```json
{
  "error": "CouchDB configuration missing"
}
```

```json
{
  "error": "Failed to fetch from database"
}
```

## JavaScript/TypeScript Beispiele

### Einfacher GET Request

```typescript
async function getTestbedInfo() {
  try {
    const response = await fetch("/api/testbed-info", {
      headers: {
        Authorization: "Bearer TestBedJSMKey",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Testbed Info:", data);
    return data;
  } catch (error) {
    console.error("Error fetching testbed info:", error);
  }
}
```

### POST Request mit Filter

```typescript
async function getFilteredTestbedInfo(filter: object) {
  try {
    const response = await fetch('/api/testbed-info', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer TestBedJSMKey',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filter })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered testbed info:', error);
  }
}

# Beispiel: Nur aktivierte Testbeds
getFilteredTestbedInfo({ enabled: true });
```

### React Hook Beispiel

```typescript
import { useState, useEffect } from "react";

interface TestbedData {
  testbedId: number;
  name: string;
  enabled: boolean;
  servers: {
    ort: string;
    gruppe: string;
  }[];
}

function useTestbedInfo() {
  const [data, setData] = useState<TestbedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/testbed-info", {
          headers: {
            Authorization: "Bearer TestBedJSMKey",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch testbed info");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
```

## Python Beispiel

```python
import requests
import json

def get_testbed_info():
    url = "http://localhost:3000/api/testbed-info"
    headers = {
        "Authorization": "Bearer TestBedJSMKey"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()
        print(f"Found {data['count']} testbed entries")
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching testbed info: {e}")
        return None

def get_filtered_testbed_info(filter_criteria):
    url = "http://localhost:3000/api/testbed-info"
    headers = {
        "Authorization": "Bearer TestBedJSMKey",
        "Content-Type": "application/json"
    }
    payload = {"filter": filter_criteria}

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching filtered testbed info: {e}")
        return None

# Beispiel-Nutzung
testbed_data = get_testbed_info()
active_testbeds = get_filtered_testbed_info({"enabled": True})
```

## Sicherheitshinweise

⚠️ **Wichtig**: Der API-Key ist hardcodiert und sollte nur in vertrauenswürdigen Umgebungen verwendet werden.

- Der API-Key `TestBedInfoJSMKey` gewährt vollen Lesezugriff auf die Testbed-Daten
- Für Produktionsumgebungen sollte ein robusteres Authentifizierungssystem implementiert werden
- Loggen Sie API-Zugriffe für Sicherheitsaudits

## Umgebungsvariablen

Stellen Sie sicher, dass folgende Umgebungsvariablen konfiguriert sind:

- `DB_URL`: URL der CouchDB-Instanz (Standard: "http://localhost:5984/")
- `DB_USERNAME`: CouchDB-Benutzername (Standard: "admin")
- `DB_PASSWORD`: CouchDB-Passwort (Standard: "admin_password")
- `ADMIN_PASSWORD`: Admin-Passwort für die Anwendung (Standard: "pass")
- `JWT_SECRET`: Secret-Key für JWT-Token-Generierung

## Status Codes

- `200`: Erfolgreiche Abfrage
- `401`: Ungültiger oder fehlender API-Key
- `500`: Serverfehler oder Datenbankverbindungsproblem
