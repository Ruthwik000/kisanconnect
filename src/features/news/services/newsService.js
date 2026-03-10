/**
 * News Service - Direct Firestore access
 * Reads data directly from Firestore, eliminating backend dependency
 */

import { 
  getAllNewsFromFirestore,
  getNewsByCategoryFromFirestore,
  searchNewsInFirestore,
  subscribeToNewsUpdatesFromFirestore,
  getLatestMarketPricesFromFirestore,
  getLatestGovernmentSchemesFromFirestore
} from './newsFirestoreService';

/**
 * Get all news directly from Firestore
 */
export const getAllNews = async (limitCount = 50) => {
  return await getAllNewsFromFirestore(limitCount);
};

/**
 * Get news by category directly from Firestore
 */
export const getNewsByCategory = async (category, limitCount = 50) => {
  return await getNewsByCategoryFromFirestore(category, limitCount);
};

/**
 * Search news directly in Firestore
 */
export const searchNews = async (searchTerm, category = null, limitCount = 50) => {
  return await searchNewsInFirestore(searchTerm, category, limitCount);
};

/**
 * Get latest market prices directly from Firestore
 */
export const getLatestMarketPrices = async (limitCount = 10) => {
  return await getLatestMarketPricesFromFirestore(limitCount);
};

/**
 * Get latest government schemes directly from Firestore
 */
export const getLatestGovernmentSchemes = async (limitCount = 10) => {
  return await getLatestGovernmentSchemesFromFirestore(limitCount);
};

/**
 * Subscribe to real-time news updates from Firestore
 */
export const subscribeToNewsUpdates = (callback, category = null, limitCount = 20) => {
  return subscribeToNewsUpdatesFromFirestore(callback, category, limitCount);
};

/**
 * Refresh all data (force reload from Firestore)
 */
export const refreshAllData = async () => {
  try {
    console.log('Refreshing all news data from Firestore...');
    return await getAllNewsFromFirestore(50);
  } catch (error) {
    console.error('Error refreshing data:', error);
    return [];
  }
};