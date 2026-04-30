// Set cache timeout to 10 minutes (600,000 milliseconds)
const CACHE_TIMEOUT = 10 * 60 * 1000;

export const getWeatherByCity = async (city) => {
  const cacheKey = `weather_cache_${city.toLowerCase().trim()}`;
  
  // 1. Check if we have valid cached data
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_TIMEOUT;
    
    if (!isExpired) {
      console.log(`Loading ${city} from cache...`);
      return data;
    }
  }

  // 2. Convert the city name into Latitude & Longitude using Open-Meteo's Geocoding API
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
  const geoData = await geoRes.json();
  
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('City not found');
  }

  const location = geoData.results[0];

  // 3. Fetch the rich weather data
  const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`);
  const weatherData = await weatherRes.json();

  // 4. Helper to translate Open-Meteo weather codes
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

  const finalResult = {
    name: location.name,
    country: location.country_code,
    weather: [{ id: mappedCode.id, description: mappedCode.desc }],
    current: {
      temp: weatherData.current.temperature_2m,
      humidity: weatherData.current.relative_humidity_2m,
    },
    hourly: weatherData.hourly, 
    daily: weatherData.daily
  };

  // 5. Save the fresh data to localStorage before returning
  localStorage.setItem(cacheKey, JSON.stringify({
    data: finalResult,
    timestamp: Date.now()
  }));

  return finalResult;
};