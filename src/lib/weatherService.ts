// Example: Get weather from Bright Sky using a ZIP code (e.g. 10115 Berlin)

export async function getWeatherByZip(zip, country = "DE") {
  try {
    // Step 1: Convert ZIP -> coordinates using Nominatim
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=${country}&format=json&limit=1`,
      { headers: { "User-Agent": "YourAppName/1.0 (contact@example.com)" } }
    );
    const geoData = await geoRes.json();

    if (geoData.length === 0) throw new Error("ZIP not found");
    const { lat, lon } = geoData[0];

    // Step 2: Query Bright Sky with coordinates
    const weatherRes = await fetch(
      `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`
    );
    const weatherData = await weatherRes.json();

    console.log(`Weather for ${zip} (${lat}, ${lon}):`);
    console.log({
      temperature: weatherData.weather.temperature,
      condition: weatherData.weather.condition,
      windSpeed: weatherData.weather.wind_speed,
      source: weatherData.sources[0]?.station_name,
    });
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
}

