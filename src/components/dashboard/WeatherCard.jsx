import { useState, useEffect } from 'react';
import { getWeatherByCity } from '../../api/weather';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, CloudDrizzle, CloudSun } from 'lucide-react';

// NEW PROPS: Added onMoveUp, onMoveDown, isFirst, and isLast
export default function WeatherCard({ city, locationId, onDelete, isCelsius, onUpdateTheme, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    getWeatherByCity(city)
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [city]);

  if (loading) return <p style={{ color: 'white' }}>Loading weather for {city}...</p>;
  if (error) return <p style={{ color: '#ff6b6b' }}>Error for {city}: {error}</p>;
  if (!weather) return null;

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatHour = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }); 
  };

  const formatTemp = (celsiusTemp) => {
    if (isCelsius) return Math.round(celsiusTemp);
    return Math.round((celsiusTemp * 9/5) + 32); 
  };

  const getWeatherIconByWMO = (wmo, size = 24) => {
    if (wmo === 0 || wmo === 1) return <Sun size={size} />; 
    if (wmo === 2) return <CloudSun size={size} />; 
    if (wmo === 3) return <Cloud size={size} />; 
    if (wmo === 45 || wmo === 48) return <CloudFog size={size} />;
    if ([51, 53, 55, 56, 57].includes(wmo)) return <CloudDrizzle size={size} />;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(wmo)) return <CloudRain size={size} />;
    if ([71, 73, 75, 77, 85, 86].includes(wmo)) return <Snowflake size={size} />;
    if ([95, 96, 99].includes(wmo)) return <CloudLightning size={size} />;
    return <Sun size={size} />; 
  };

  const tempUnit = isCelsius ? '°C' : '°F';
  const degreeSymbol = '°'; 

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white'
  };

  // Reusable style for the top right buttons
  const actionBtnStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
    color: 'white', borderRadius: '50%', width: '32px', height: '32px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s ease'
  };

  const todayMax = weather.daily.temperature_2m_max[0];
  const todayMin = weather.daily.temperature_2m_min[0];
  const todaySunrise = formatTime(weather.daily.sunrise[0]);
  const todaySunset = formatTime(weather.daily.sunset[0]);
  const todayUV = weather.daily.uv_index_max[0];
  const todayWeatherCode = weather.daily.weather_code[0];

  return (
    <div 
      onMouseEnter={() => {
        setIsHovered(true);
        if (onUpdateTheme) onUpdateTheme(weather.weather[0].id);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onUpdateTheme) onUpdateTheme(weather.weather[0].id);
      }}
      style={{
        ...glassStyle,
        borderRadius: '24px', padding: '30px', width: '100%',
        maxWidth: '750px', position: 'relative', margin: '0 auto',
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 15px 40px 0 rgba(0, 0, 0, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      
      {/* NEW: Action Buttons Container */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 5 }}>
        {!isFirst && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            style={actionBtnStyle}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            title="Move Up"
          >
            ↑
          </button>
        )}
        {!isLast && (
          <button 
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            style={actionBtnStyle}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            title="Move Down"
          >
            ↓
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(locationId); }}
          style={actionBtnStyle}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,60,60,0.6)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          title="Delete"
        >
          ✕
        </button>
      </div>

      {/* Main Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.8, letterSpacing: '1px' }}>Country Code: {weather.country}</p>
          <h2 style={{ margin: '5px 0', fontSize: '42px', fontWeight: '800' }}>{weather.name}</h2>
          <p style={{ margin: '5px 0', fontSize: '16px', opacity: 0.9 }}>Humidity: {weather.current.humidity}%</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            {getWeatherIconByWMO(todayWeatherCode, 32)}
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>{weather.weather[0].description}</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h1 style={{ margin: 0, fontSize: '72px', fontWeight: 'bold', lineHeight: '1' }}>{formatTemp(weather.current.temp)}{tempUnit}</h1>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px', fontSize: '18px' }}>
            <p style={{ margin: 0 }}>Min <br/><strong>{formatTemp(todayMin)}{degreeSymbol}</strong></p>
            <p style={{ margin: 0 }}>Max <br/><strong>{formatTemp(todayMax)}{degreeSymbol}</strong></p>
          </div>
        </div>
      </div>

      {/* Hourly Forecast */}
      {weather.hourly && weather.hourly.time && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '15px' }}>Today's Forecast</h3>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {(() => {
              const now = new Date();
              const startIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= now.getTime());
              const validStartIndex = startIndex !== -1 ? startIndex : 0;
              
              return weather.hourly.time.slice(validStartIndex, validStartIndex + 24).map((dateStr, index) => {
                const actualIndex = validStartIndex + index;
                const hourCode = weather.hourly.weather_code[actualIndex];
                const hourTemp = weather.hourly.temperature_2m[actualIndex];
                
                return (
                  <div key={index} style={{ ...glassStyle, boxShadow: 'none', borderRadius: '16px', padding: '15px 20px', minWidth: '90px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                      {index === 0 ? 'Now' : formatHour(dateStr)}
                    </p>
                    {getWeatherIconByWMO(hourCode, 24)}
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                      {formatTemp(hourTemp)}{degreeSymbol}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* 5-Day Forecast Mapping */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '15px' }}>Next 5 Days</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {weather.daily.time.slice(1, 6).map((dateStr, i) => {
            const actualIndex = i + 1;
            const dailyCode = weather.daily.weather_code[actualIndex];
            
            return (
              <div key={actualIndex} style={{ ...glassStyle, boxShadow: 'none', borderRadius: '16px', padding: '15px 20px', minWidth: '110px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{getDayName(dateStr)}</p>
                {getWeatherIconByWMO(dailyCode, 28)}
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {formatTemp(weather.daily.temperature_2m_max[actualIndex])}{degreeSymbol} / {formatTemp(weather.daily.temperature_2m_min[actualIndex])}{degreeSymbol}
                </p>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>{dateStr.substring(5)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Air Quality */}
        <div style={{ ...glassStyle, boxShadow: 'none', borderRadius: '16px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '500' }}>Air Quality</h4>
          <p style={{ margin: '0 0 5px 0', color: '#55c57a', fontWeight: 'bold', fontSize: '20px' }}>3 - Low Risk</p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, lineHeight: '1.4' }}>Suitable for normal outdoor activities.</p>
        </div>

        {/* Sunrise / Sunset */}
        <div style={{ ...glassStyle, boxShadow: 'none', borderRadius: '16px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '500' }}>Sunrise / Sunset</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sun size={20} color="#f5b041" />
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>{todaySunrise}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sun size={20} color="#ff6b6b" />
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>{todaySunset}</p>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div style={{ ...glassStyle, boxShadow: 'none', borderRadius: '16px', padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '500' }}>Max UV Index</h4>
          <p style={{ margin: '0 0 5px 0', color: todayUV < 3 ? '#55c57a' : todayUV < 6 ? '#f5b041' : '#ff6b6b', fontWeight: 'bold', fontSize: '20px' }}>
            {todayUV} - {todayUV < 3 ? 'Low' : todayUV < 6 ? 'Moderate' : 'High'}
          </p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, lineHeight: '1.4' }}>
            {todayUV < 3 ? "Minimal danger from the sun's rays." : "Wear sunscreen if outdoors."}
          </p>
        </div>

      </div>
    </div>
  );
}