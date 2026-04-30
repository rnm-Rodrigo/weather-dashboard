import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ dailyData }) {
  // We format the raw Open-Meteo arrays into an array of objects for the chart
  const data = dailyData.time.map((date, index) => ({
    name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    temp: Math.round(dailyData.temperature_2m_max[index]),
  }));

  return (
    <div style={{ 
      width: '100%', 
      height: '180px', 
      marginTop: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      padding: '10px'
    }}>
      <h4 style={{ margin: '0 0 10px 10px', fontSize: '14px', opacity: 0.8 }}>7-Day Forecast</h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'white', fontSize: 12, opacity: 0.7 }}
          />
          {/* Hide YAxis for a cleaner "Sparkline" look, or show it for precision */}
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.7)', 
              border: 'none', 
              borderRadius: '8px',
              backdropFilter: 'blur(4px)'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#ffffff" 
            strokeWidth={3} 
            dot={{ fill: '#ffffff', r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            // This makes the line glow
            style={{ filter: 'drop-shadow(0px 0px 8px rgba(255,255,255,0.8))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}