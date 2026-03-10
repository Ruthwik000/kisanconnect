/**
 * Dashboard Hook
 * Custom hook for managing dashboard data and real-time updates
 */

import { useState, useEffect } from 'react';
import { 
  getDashboardData, 
  getLatestMarketPrices, 
  getLatestSchemes,
  subscribeToNewsUpdatesForDashboard,
  subscribeToMarketPrices,
  getWeatherData
} from '@/features/dashboard/services/dashboardService';

export const useDashboard = (userId, location = 'Hyderabad') => {
  const [dashboardData, setDashboardData] = useState(null);
  const [marketPrices, setMarketPrices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [dashData, prices, schemesData, weatherData] = await Promise.all([
          getDashboardData(userId),
          getLatestMarketPrices(3),
          getLatestSchemes(2),
          getWeatherData(location.split(',')[0].trim())
        ]);

        setDashboardData(dashData);
        setMarketPrices(prices);
        setSchemes(schemesData);
        setWeather(weatherData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [userId, location]);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (!userId) return;

    const unsubscribeNews = subscribeToNewsUpdatesForDashboard((news) => {
      setDashboardData(prev => prev ? { ...prev, news } : null);
    }, 3);

    const unsubscribePrices = subscribeToMarketPrices((prices) => {
      setMarketPrices(prices.slice(0, 3));
    }, 3);

    return () => {
      unsubscribeNews();
      unsubscribePrices();
    };
  }, [userId]);

  // Refresh weather data periodically
  useEffect(() => {
    const refreshWeather = async () => {
      try {
        const weatherData = await getWeatherData(location.split(',')[0].trim());
        setWeather(weatherData);
      } catch (err) {
        console.error('Error refreshing weather:', err);
      }
    };

    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(refreshWeather, 30 * 60 * 1000);
    return () => clearInterval(weatherInterval);
  }, [location]);

  const refreshData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [dashData, prices, schemesData] = await Promise.all([
        getDashboardData(userId),
        getLatestMarketPrices(3),
        getLatestSchemes(2)
      ]);

      setDashboardData(dashData);
      setMarketPrices(prices);
      setSchemes(schemesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData,
    marketPrices,
    schemes,
    weather,
    isLoading,
    error,
    refreshData
  };
};