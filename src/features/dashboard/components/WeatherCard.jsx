import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Droplets, Wind, Cloud, CloudRain, CloudSnow } from 'lucide-react';
import { getWeatherData } from '@/features/dashboard/services/dashboardService';

const WeatherCard = ({ location = 'Hyderabad' }) => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const weatherData = await getWeatherData(location);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error fetching weather:', error);
        // Set fallback weather data
        setWeather({
          temperature: 25,
          condition: 'Partly Cloudy',
          humidity: 60,
          windSpeed: 10,
          cloudCover: 30,
          icon: '02d'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  const getWeatherIcon = (iconCode) => {
    if (iconCode?.includes('01')) return <Sun className="w-5 h-5 text-[#eab308]" />;
    if (iconCode?.includes('02') || iconCode?.includes('03')) return <Cloud className="w-5 h-5 text-[#7a8478]" />;
    if (iconCode?.includes('09') || iconCode?.includes('10')) return <CloudRain className="w-5 h-5 text-[#3b82f6]" />;
    if (iconCode?.includes('13')) return <CloudSnow className="w-5 h-5 text-[#6b7280]" />;
    return <Sun className="w-5 h-5 text-[#eab308]" />;
  };

  if (isLoading) {
    return (
      <div className="kisan-card p-5 flex-1 flex flex-col justify-center items-center border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0">
        <div className="animate-pulse text-[#7a8478] text-xs">{t('weather.loadingWeather', 'Loading weather...')}</div>
      </div>
    );
  }

  return (
    <div className="kisan-card p-5 flex-1 flex flex-col justify-between border-[#eeede6] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0">
      <div className="flex justify-between items-start">
        <h3 className="text-[10px] font-bold text-[#7a8478] uppercase tracking-widest">{t('weather.localWeather', 'Local Weather')}</h3>
        {getWeatherIcon(weather?.icon)}
      </div>

      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-4xl font-black leading-none tracking-tighter">{weather?.temperature}°C</div>
        <p className="text-[11px] font-bold text-[#7a8478] mt-1.5 uppercase tracking-wide capitalize">{weather?.condition}</p>
      </div>

      <div className="space-y-2.5 border-t border-[#eeede6] pt-4">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2 text-[#7a8478]">
            <Droplets className="w-3 h-3" />
            <span className="font-semibold">{t('weather.humidity', 'Humidity')}</span>
          </div>
          <span className="font-bold text-[#2a3328]">{weather?.humidity}%</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2 text-[#7a8478]">
            <Wind className="w-3 h-3" />
            <span className="font-semibold">{t('weather.windSpeed', 'Wind Speed')}</span>
          </div>
          <span className="font-bold text-[#2a3328]">{weather?.windSpeed} km/h</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-2 text-[#7a8478]">
            <Cloud className="w-3 h-3" />
            <span className="font-semibold">{t('weather.cloudCover', 'Cloud Cover')}</span>
          </div>
          <span className="font-bold text-[#2a3328]">{weather?.cloudCover}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;