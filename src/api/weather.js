export const getWeatherByCity = async (city) => {
  // 1. Convert the city name into Latitude & Longitude using Open-Meteo's Geocoding API
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
  const geoData = await geoRes.json();
  
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('City not found');
  }

  const location = geoData.results[0];

  // 2. Fetch the rich weather data (Current, Hourly, Daily Forecast, Sunrise/Sunset, UV Index)
  // Added &hourly=temperature_2m,weather_code and timezone=auto
  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`);
  const weatherData = await weatherRes.json();

  // 3. Helper to translate Open-Meteo weather codes into text descriptions and fake OpenWeatherMap IDs (so your background themes still work!)
  const getOWMCode = (wmo) => {
    if (wmo === 0) return { id: 800, desc: "Clear sky" };
    if (wmo === 1 || wmo === 2) return { id: 802, desc: "Partly cloudy" };
    if (wmo === 3) return { id: 804, desc: "Overcast clouds" };
    if (wmo === 45 || wmo === 48) return { id: 741, desc: "Fog" };
    if ([51, 53, 55, 56, 57].includes(wmo)) return { id: 300, desc: "Drizzle" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(wmo)) return { id: 500, desc: "Rain" };
    if ([71, 73, 75, 77, 85, 86].includes(wmo)) return { id: 600, desc: "Snow" };
    if ([95, 96, 99].includes(wmo)) return { id: 200, desc: "Thunderstorm" };
    return { id: 800, desc: "Unknown" };
  };

  const mappedCode = getOWMCode(weatherData.current.weather_code);

  // 4. Return everything neatly packaged for the WeatherCard
  return {
    name: location.name,
    country: location.country_code,
    weather: [{ id: mappedCode.id, description: mappedCode.desc }],
    current: {
      temp: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
    },
    // NEW: We are passing the hourly data down to your card!
    hourly: weatherData.hourly, 
    daily: weatherData.daily
  };
};