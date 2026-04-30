import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthGuard from './components/auth/AuthGuard';
import { AuthProvider } from './context/AuthContext';
import WeatherCard from './components/dashboard/WeatherCard';
import AnimatedBackground from './components/ui/AnimatedBackground';
import CitySearch from './components/dashboard/CitySearch';
import { THEMES } from './lib/themeMap';
import { useLocations } from './hooks/useLocations';
import { getThemeFromWeather } from './lib/themeHelper';
import { getWeatherByCity } from './api/weather';
import './App.css';

function AppContent({ activeTheme, setActiveTheme }) {
  const [isCelsius, setIsCelsius] = useState(true);
  const { locations, addLocation, removeLocation } = useLocations();
  const [displayLocations, setDisplayLocations] = useState([]);

  useEffect(() => {
    setDisplayLocations(locations);
  }, [locations]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (displayLocations.length > 0) {
      const primaryCity = displayLocations[0].city_name;
      
      getWeatherByCity(primaryCity)
        .then(data => {
          const newTheme = getThemeFromWeather(data.weather[0].id);
          setActiveTheme(newTheme);
        })
        .catch(() => {
          console.log("Waiting for API to update theme...");
        });
    }
  }, [displayLocations, setActiveTheme]);

  const moveLocationUp = (index) => {
    if (index === 0) return;
    const newLocations = [...displayLocations];
    [newLocations[index - 1], newLocations[index]] = [newLocations[index], newLocations[index - 1]];
    setDisplayLocations(newLocations);
  };

  const moveLocationDown = (index) => {
    if (index === displayLocations.length - 1) return;
    const newLocations = [...displayLocations];
    [newLocations[index + 1], newLocations[index]] = [newLocations[index], newLocations[index + 1]];
    setDisplayLocations(newLocations);
  };

  return (
    <div className="dashboard" style={{ 
      position: 'relative', 
      padding: '40px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 10 }}>
        <button 
          onClick={() => setIsCelsius(!isCelsius)}
          style={{ 
            padding: '8px 16px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.3)', color: 'white', 
            borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '14px'
          }}
        >
          {isCelsius ? 'Switch to °F' : 'Switch to °C'}
        </button>

        <button 
          onClick={handleSignOut}
          style={{ 
            padding: '8px 16px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.3)', color: 'white', 
            borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '14px'
          }}
        >
          Sign Out
        </button>
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        Weather Dashboard
      </h1>
      
      <p style={{ marginBottom: '30px', opacity: 0.9 }}>
        Manage your favorite cities and track weather in real-time.
      </p>
      
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '40px' }}>
        <CitySearch onSearch={addLocation} />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
        gap: '30px', 
        width: '100%',
        justifyItems: 'center'
      }}>
        {displayLocations.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', padding: '40px', textAlign: 'center', 
            background: 'rgba(255,255,255,0.1)', borderRadius: '15px',
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p>No cities saved yet. Search for a city above to get started!</p>
          </div>
        ) : (
          displayLocations.map((loc, index) => (
            <WeatherCard 
              key={loc.id} 
              city={loc.city_name} 
              locationId={loc.id} 
              onDelete={removeLocation}
              isCelsius={isCelsius}
              onUpdateTheme={(weatherId) => setActiveTheme(getThemeFromWeather(weatherId))}
              onMoveUp={() => moveLocationUp(index)}
              onMoveDown={() => moveLocationDown(index)}
              isFirst={index === 0}
              isLast={index === displayLocations.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTheme, setActiveTheme] = useState(THEMES['clear-day']);

  return (
    <AuthProvider>
      <AnimatedBackground theme={activeTheme}>
        <AuthGuard>
          <AppContent activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        </AuthGuard>
      </AnimatedBackground>
    </AuthProvider>
  );
}