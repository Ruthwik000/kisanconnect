const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'd2ffedab20686979524c06aec69b3998';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Fetching weather from:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Weather API error:', response.status, errorData);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

export const fetchWeatherByCity = async (city) => {
  try {
    const url = `${OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    console.log('Fetching weather from:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Weather API error:', response.status, errorData);
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

export const getCurrentLocationWeather = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const weather = await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(weather);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Try Delhi as fallback
        fetchWeatherByCity('Delhi')
          .then(resolve)
          .catch(reject);
      },
      {
        timeout: 10000,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    );
  });
};

// Get weather advice based on conditions
export const getWeatherAdvice = (weather) => {
  const { temperature, humidity, condition } = weather;

  if (condition.includes('rain')) {
    return 'Rainy weather detected. Avoid irrigation and protect crops from excess water.';
  }

  if (temperature > 35) {
    return 'High temperature alert! Ensure adequate irrigation and protect crops from heat stress.';
  }

  if (temperature < 10) {
    return 'Cold weather. Protect sensitive crops from frost damage.';
  }

  if (humidity > 80) {
    return 'High humidity. Monitor crops for fungal diseases and ensure good ventilation.';
  }

  if (humidity < 40) {
    return 'Low humidity. Consider increasing irrigation frequency.';
  }

  if (condition.includes('clear') && humidity >= 50 && humidity <= 70) {
    return 'Perfect weather for irrigation. Consider watering your crops in the evening.';
  }

  return 'Good farming conditions. Monitor your crops regularly for best results.';
};
