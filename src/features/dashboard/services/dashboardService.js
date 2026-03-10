/**
 * Dashboard Service
 * Fetches real-time data for dashboard directly from Firestore
 */

import { getUserDiseaseDetectionsFromFirestore, getUserDiseaseStats } from '@/features/disease-detection/services/diseaseFirestoreService';
import { getUserConversationsFromFirestore } from '@/features/chat/services/chatFirestoreService';
import { 
  getNewsByCategoryFromFirestore, 
  subscribeToNewsUpdatesFromFirestore 
} from '@/features/news/services/newsFirestoreService';

/**
 * Get dashboard overview data for a user
 */
export const getDashboardData = async (userId) => {
  try {
    console.log(`Getting dashboard data for user ${userId}`);
    
    const [
      recentNews,
      recentDetections,
      recentConversations,
      diseaseStats
    ] = await Promise.all([
      getNewsByCategoryFromFirestore('news', 5), // Get 5 latest news items
      getUserDiseaseDetectionsFromFirestore(userId, 3), // Get 3 recent detections
      getUserConversationsFromFirestore(userId, 3), // Get 3 recent conversations
      getUserDiseaseStats(userId) // Get disease detection statistics
    ]);

    return {
      news: recentNews,
      recentDetections,
      recentConversations,
      diseaseStats,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    return {
      news: [],
      recentDetections: [],
      recentConversations: [],
      diseaseStats: {
        totalDetections: 0,
        healthyPlants: 0,
        diseasedPlants: 0,
        commonDiseases: {},
        recentDetections: []
      },
      lastUpdated: new Date()
    };
  }
};

/**
 * Get latest market prices from Firestore
 */
export const getLatestMarketPrices = async (limitCount = 5) => {
  try {
    const prices = await getNewsByCategoryFromFirestore('price', limitCount);
    return prices;
  } catch (error) {
    console.error('Error getting market prices:', error);
    return [];
  }
};

/**
 * Get latest government schemes from Firestore
 */
export const getLatestSchemes = async (limitCount = 3) => {
  try {
    const schemes = await getNewsByCategoryFromFirestore('scheme', limitCount);
    return schemes;
  } catch (error) {
    console.error('Error getting schemes:', error);
    return [];
  }
};

/**
 * Subscribe to real-time news updates for dashboard
 */
export const subscribeToNewsUpdatesForDashboard = (callback, limitCount = 5) => {
  try {
    return subscribeToNewsUpdatesFromFirestore(callback, 'news', limitCount);
  } catch (error) {
    console.error('Error subscribing to news updates:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Subscribe to real-time market price updates
 */
export const subscribeToMarketPrices = (callback, limitCount = 5) => {
  try {
    return subscribeToNewsUpdatesFromFirestore(callback, 'price', limitCount);
  } catch (error) {
    console.error('Error subscribing to market prices:', error);
    return () => {};
  }
};

/**
 * Get weather data from OpenWeather API
 */
export const getWeatherData = async (location = 'Hyderabad') => {
  try {
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!API_KEY || API_KEY === 'your_openweather_api_key_here') {
      console.error('OpenWeather API key not configured');
      return null;
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      cloudCover: data.clouds.all,
      icon: data.weather[0].icon,
      location: data.name
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};