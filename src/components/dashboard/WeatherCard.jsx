import { useState, useEffect } from 'react';
import { getWeatherByCity } from '../../api/weather';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, CloudDrizzle, CloudSun } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Internal Chart Component ---
const DayTrendChart = ({ hourlyData, isCelsius }) => {
  const now = new Date();
  const startIndex = hourlyData.time.findIndex(t => new Date(t).getTime() >= now.getTime());
  const validStartIndex = startIndex !== -1 ? startIndex : 0;

  const data = hourlyData.time.slice(validStartIndex, validStartIndex + 24).map((time, index) => {
    const actualIndex = validStartIndex + index;
    const rawTemp = hourlyData.temperature_2m[actualIndex];
    const displayTemp = isCelsius ? Math.round(rawTemp) : Math.round((rawTemp * 9/5) + 32);

    return {
      time: index === 0 ? 'Now' : new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temp: displayTemp,
    };
  });

  return (
    <div style={{ 
      width: '100%', height: '150px', marginTop: '10px', marginBottom: '30px',
      background: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', padding: '20px'
    }}>
      <h4 style={{ margin: '0 0 15px 5px', fontSize: '12px', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
        24-Hour Temperature Trend ({isCelsius ? '°C' : '°F'})
      </h4>
      <ResponsiveContainer width="100%" height="75%">
        <LineChart data={data}>
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'white', fontSize: 10, opacity: 0.5 }} interval={4} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: 'none', borderRadius: '12px', backdropFilter: 'blur(6px)' }}
            itemStyle={{ color: '#fff', fontSize: '12px' }}
            formatter={(value) => [`${value}°${isCelsius ? 'C' : 'F'}`, 'Temp']}
          />
          <Line type="monotone" dataKey="temp" stroke="#ffffff" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function WeatherCard({ city, locationId, onDelete, isCelsius, onUpdateTheme, onMoveUp, onMoveDown, isFirst, isLast }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading {city}...</p>;
  if (error) return <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px' }}>Error: {error}</p>;
  if (!weather) return null;

  // Formatting Helpers
  const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatHour = (isoString) => new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  const formatTemp = (celsiusTemp) => isCelsius ? Math.round(celsiusTemp) : Math.round((celsiusTemp * 9/5) + 32);
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherIconByWMO = (wmo, size = 24) => {
    if ([0, 1].includes(wmo)) return <Sun size={size} />; 
    if (wmo === 2) return <CloudSun size={size} />; 
    if (wmo === 3) return <Cloud size={size} />; 
    if ([45, 48].includes(wmo)) return <CloudFog size={size} />;
    if ([51, 53, 55, 56, 57].includes(wmo)) return <CloudDrizzle size={size} />;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(wmo)) return <CloudRain size={size} />;
    if ([71, 73, 75, 77, 85, 86].includes(wmo)) return <Snowflake size={size} />;
    if ([95, 96, 99].includes(wmo)) return <CloudLightning size={size} />;
    return <Sun size={size} />; 
  };

  const glassStyle = { background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white' };
  const actionBtnStyle = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

  const todayUV = weather.daily.uv_index_max[0];

  return (
    <div style={{ ...glassStyle, borderRadius: '24px', padding: '35px', maxWidth: '780px', position: 'relative', margin: '0 auto 30px auto' }}>
      
      {/* Action Buttons */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 10 }}>
        {!isFirst && <button onClick={onMoveUp} style={actionBtnStyle}>↑</button>}
        {!isLast && <button onClick={onMoveDown} style={actionBtnStyle}>↓</button>}
        <button onClick={() => onDelete(locationId)} style={{ ...actionBtnStyle, background: 'rgba(255, 80, 80, 0.3)' }}>✕</button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
        <div>
          <p style={{ margin: 0, opacity: 0.6, fontSize: '13px', fontWeight: '500', textTransform: 'uppercase' }}>Country Code: {weather.country}</p>
          <h2 style={{ fontSize: '44px', margin: '5px 0', fontWeight: '800' }}>{weather.name}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>Humidity: {weather.current.humidity}%</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
            {getWeatherIconByWMO(weather.daily.weather_code[0], 28)}
            <p style={{ margin: 0, fontSize: '20px' }}>{weather.weather[0].description}</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: 'bold', lineHeight: 1 }}>
            {formatTemp(weather.current.temp)}{isCelsius ? '°C' : '°F'}
          </h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', opacity: 0.8 }}>
            Min <strong>{formatTemp(weather.daily.temperature_2m_min[0])}°</strong>  Max <strong>{formatTemp(weather.daily.temperature_2m_max[0])}°</strong>
          </p>
        </div>
      </div>

      {/* Today's Forecast - FIXED INDEX SYNCING */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', opacity: 0.7, fontWeight: '600' }}>Today's Forecast</h3>
        <div style={{ 
          display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '15px',
          scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' 
        }}>
          {(() => {
            const now = new Date();
            const startIndex = weather.hourly.time.findIndex(t => new Date(t).getTime() >= now.getTime());
            const validStartIndex = startIndex !== -1 ? startIndex : 0;
            
            return weather.hourly.time.slice(validStartIndex, validStartIndex + 15).map((time, i) => {
              const actualIndex = validStartIndex + i;
              return (
                <div key={i} style={{ ...glassStyle, borderRadius: '18px', padding: '12px', minWidth: '85px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.7 }}>{i === 0 ? 'Now' : formatHour(time)}</p>
                  <div style={{ margin: '8px 0' }}>{getWeatherIconByWMO(weather.hourly.weather_code[actualIndex], 22)}</div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{formatTemp(weather.hourly.temperature_2m[actualIndex])}°</p>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Temperature Graph */}
      <DayTrendChart hourlyData={weather.hourly} isCelsius={isCelsius} />

      {/* Next 5 Days */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', opacity: 0.7, fontWeight: '600' }}>Next 5 Days</h3>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' }}>
          {weather.daily.time.slice(1, 6).map((date, i) => (
            <div key={i} style={{ ...glassStyle, borderRadius: '18px', padding: '15px', minWidth: '105px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{getDayName(date)}</p>
              <div style={{ margin: '8px 0' }}>{getWeatherIconByWMO(weather.daily.weather_code[i+1], 24)}</div>
              <p style={{ margin: 0, fontSize: '14px' }}>{formatTemp(weather.daily.temperature_2m_max[i+1])}° / {formatTemp(weather.daily.temperature_2m_min[i+1])}°</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '11px', opacity: 0.4 }}>{date.substring(5)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        {/* Air Quality */}
        <div style={{ ...glassStyle, borderRadius: '18px', padding: '18px' }}>
          <h4 style={{ fontSize: '12px', opacity: 0.5, margin: '0 0 10px 0', textTransform: 'uppercase', fontWeight: '600' }}>Air Quality</h4>
          <p style={{ color: '#55c57a', fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px 0' }}>3 - Low Risk</p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, lineHeight: '1.4' }}>Suitable for normal outdoor activities.</p>
        </div>

        {/* Sunrise / Sunset */}
        <div style={{ ...glassStyle, borderRadius: '18px', padding: '18px' }}>
          <h4 style={{ fontSize: '12px', opacity: 0.5, margin: '0 0 10px 0', textTransform: 'uppercase', fontWeight: '600' }}>Sunrise / Sunset</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sun size={16} color="#f5b041" />
            <p style={{ fontSize: '15px', margin: 0, fontWeight: '500' }}>{formatTime(weather.daily.sunrise[0])}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={16} color="#ff6b6b" />
            <p style={{ fontSize: '15px', margin: 0, fontWeight: '500' }}>{formatTime(weather.daily.sunset[0])}</p>
          </div>
        </div>

        {/* UV Index */}
        <div style={{ ...glassStyle, borderRadius: '18px', padding: '18px' }}>
          <h4 style={{ fontSize: '12px', opacity: 0.5, margin: '0 0 10px 0', textTransform: 'uppercase', fontWeight: '600' }}>Max UV Index</h4>
          <p style={{ 
            color: todayUV < 3 ? '#55c57a' : todayUV < 6 ? '#f5b041' : '#ff6b6b', 
            fontWeight: 'bold', fontSize: '18px', margin: '0 0 5px 0' 
          }}>
            {todayUV} - {todayUV < 3 ? 'Low' : todayUV < 6 ? 'Moderate' : 'High'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, lineHeight: '1.4' }}>
            {todayUV < 3 ? "Minimal danger from the sun's rays." : "Wear sunscreen if outdoors."}
          </p>
        </div>
      </div>
    </div>
  );
}