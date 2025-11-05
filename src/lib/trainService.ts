const stationId = "8000294"; // EVA-Nummer von Osnabrück Hbf (z. B.) – musst du validieren
const url = `https://v5.db.transport.rest/departures?station=${stationId}&limit=10`;

async function getNextTrains() {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error: ${resp.status}`);
    const data = await resp.json();
    console.log("Next departures:", data);
  } catch (err) {
    console.error("Error fetching DB departures:", err);
  }
}

getNextTrains();
