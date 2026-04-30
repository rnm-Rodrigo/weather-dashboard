import { THEMES } from './themeMap';

// Translates OpenWeatherMap codes into our visual themes
export function getThemeFromWeather(weatherCode) {
  if (!weatherCode) return THEMES['default'];

  // Thunderstorm codes (200-299)
  if (weatherCode >= 200 && weatherCode < 300) return THEMES['storm'];
  
  // Drizzle and Rain codes (300-599)
  if (weatherCode >= 300 && weatherCode < 600) return THEMES['glassmorphism-rain'];
  
  // Snow codes (600-699)
  if (weatherCode >= 600 && weatherCode < 700) return THEMES['snow'];
  
  // Atmosphere and Fog codes (700-799)
  if (weatherCode >= 700 && weatherCode < 800) return THEMES['fog-mist'];
  
  // Clear sky code (800)
  if (weatherCode === 800) return THEMES['clear-day'];
  
  // Cloudy codes (801-809)
  if (weatherCode > 800) return THEMES['overcast'];

  return THEMES['default'];
}