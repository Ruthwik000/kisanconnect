import React from 'react';
import { Sun, Droplets, Wind, Cloud } from 'lucide-react';

const WeatherCard = ({ weather = { temp: '23°C', condition: 'Clear Sky', humidity: '43%', windSpeed: '13 km/h', cloudCover: '20%' } }) => {
  const weatherData = [
    { icon: Droplets, val: weather.humidity, label: 'Humidity' },
    { icon: Wind, val: weather.windSpeed, label: 'Wind Speed' },
    { icon: Cloud, val: weather.cloudCover, label: 'Cloud Cover' }
  ];

  return (
    <div className="kisan-card p-5 flex-1 flex flex-col justify-between border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0">
      <div className="flex justify-between items-start">
        <h3 className="text-[10px] font-bold text-[#7a8478] uppercase tracking-widest">Local Weather</h3>
        <Sun className="w-5 h-5 text-[#eab308]" />
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-4xl font-black leading-none tracking-tighter">{weather.temp}</div>
        <p className="text-[11px] font-bold text-[#7a8478] mt-1.5 uppercase tracking-wide">{weather.condition}</p>
      </div>

      <div className="space-y-2.5 border-t border-[#eeede6] pt-4">
        {weatherData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2 text-[#7a8478]">
              <item.icon className="w-3 h-3" />
              <span className="font-semibold">{item.label}</span>
            </div>
            <span className="font-bold text-[#2a3328]">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;