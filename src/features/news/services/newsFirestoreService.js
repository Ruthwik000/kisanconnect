/**
 * News Firestore Service - Direct Firestore access for news data
 * Reads from multiple collections: agricultural_news, market_prices, government_schemes
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit, 
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

/**
 * Get all news from multiple Firestore collections
 */
export const getAllNewsFromFirestore = async (limitCount = 50) => {
  try {
    console.log('Fetching all news from Firestore collections...');
    
    // Fetch from all three collections
    const [newsData, pricesData, schemesData] = await Promise.all([
      getFromCollection('agricultural_news', limitCount / 3),
      getFromCollection('market_prices', limitCount / 3),
      getFromCollection('government_schemes', limitCount / 3)
    ]);
    
    // Combine and normalize data
    const allNews = [
      ...newsData.map(item => ({ ...item, category: 'news' })),
      ...pricesData.map(item => ({ ...item, category: 'price' })),
      ...schemesData.map(item => ({ ...item, category: 'scheme' }))
    ];
    
    // Sort by date
    const sortedNews = allNews.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || a.createdAt);
      const dateB = new Date(b.created_at || b.date || b.createdAt);
      return dateB - dateA;
    }).slice(0, limitCount);
    
    console.log(`Retrieved ${sortedNews.length} total items from Firestore`);
    return sortedNews;
    
  } catch (error) {
    console.error('Error fetching all news from Firestore:', error);
    return [];
  }
};

/**
 * Get news by category from appropriate Firestore collection
 */
export const getNewsByCategoryFromFirestore = async (category, limitCount = 50) => {
  try {
    console.log(`Fetching ${category} from Firestore...`);
    
    let collectionName;
    switch (category) {
      case 'news':
        collectionName = 'agricultural_news';
        break;
      case 'price':
        collectionName = 'market_prices';
        break;
      case 'scheme':
        collectionName = 'government_schemes';
        break;
      default:
        console.warn(`Unknown category: ${category}`);
        return [];
    }
    
    const data = await getFromCollection(collectionName, limitCount);
    const normalizedData = data.map(item => ({ ...item, category }));
    
    console.log(`Retrieved ${normalizedData.length} ${category} items from Firestore`);
    return normalizedData;
    
  } catch (error) {
    console.error(`Error fetching ${category} from Firestore:`, error);
    return [];
  }
};

/**
 * Helper function to get data from a specific collection
 */
const getFromCollection = async (collectionName, limitCount = 50) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, firestoreLimit(limitCount));
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        // Normalize field names
        imageUrl: docData.imageUrl || docData.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
        created_at: docData.created_at || docData.createdAt || new Date().toISOString(),
        updated_at: docData.updated_at || docData.updatedAt || new Date().toISOString(),
        is_active: docData.is_active !== false, // Default to true if not specified
        
        // Ensure title and summary have proper structure
        title: docData.title || {
          en: docData.title_en || docData.name || 'No title available',
          hi: docData.title_hi || 'शीर्षक उपलब्ध नहीं',
          te: docData.title_te || 'శీర్షిక అందుబాటులో లేదు'
        },
        summary: docData.summary || {
          en: docData.summary_en || docData.description || 'No summary available',
          hi: docData.summary_hi || 'सारांश उपलब्ध नहीं',
          te: docData.summary_te || 'సారాంశం అందుబాటులో లేదు'
        },
        
        // Ensure other required fields
        source: docData.source || 'Unknown Source',
        url: docData.url || '#',
        date: docData.date || docData.created_at || docData.createdAt || new Date().toISOString()
      };
    });
    
    // Filter active items and sort
    return data
      .filter(item => item.is_active !== false)
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || a.createdAt);
        const dateB = new Date(b.created_at || b.date || b.createdAt);
        return dateB - dateA;
      });
      
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    return [];
  }
};

/**
 * Search news in Firestore
 */
export const searchNewsInFirestore = async (searchTerm, category = null, limitCount = 50) => {
  try {
    console.log(`Searching news for: ${searchTerm}`);
    
    // Get all news first, then filter (Firestore doesn't support text search)
    const news = category ? 
      await getNewsByCategoryFromFirestore(category, 100) : 
      await getAllNewsFromFirestore(100);
    
    // Filter results by search term
    const filteredData = news.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title?.en?.toLowerCase().includes(searchLower) ||
        item.title?.hi?.toLowerCase().includes(searchLower) ||
        item.title?.te?.toLowerCase().includes(searchLower) ||
        item.summary?.en?.toLowerCase().includes(searchLower) ||
        item.commodity?.toLowerCase().includes(searchLower) ||
        item.market?.toLowerCase().includes(searchLower)
      );
    }).slice(0, limitCount);
    
    console.log(`Found ${filteredData.length} items matching search`);
    return filteredData;
    
  } catch (error) {
    console.error('Error searching news in Firestore:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates from multiple Firestore collections
 */
export const subscribeToNewsUpdatesFromFirestore = (callback, category = null, limitCount = 20) => {
  try {
    if (category) {
      // Subscribe to specific category
      let collectionName;
      switch (category) {
        case 'news':
          collectionName = 'agricultural_news';
          break;
        case 'price':
          collectionName = 'market_prices';
          break;
        case 'scheme':
          collectionName = 'government_schemes';
          break;
        default:
          console.warn(`Unknown category: ${category}`);
          callback([]);
          return () => {};
      }
      
      return subscribeToCollection(collectionName, category, callback, limitCount);
    } else {
      // Subscribe to all collections
      const unsubscribers = [];
      
      const combinedCallback = (() => {
        let newsData = [];
        let pricesData = [];
        let schemesData = [];
        
        return (type, data) => {
          switch (type) {
            case 'news':
              newsData = data;
              break;
            case 'price':
              pricesData = data;
              break;
            case 'scheme':
              schemesData = data;
              break;
          }
          
          // Combine all data
          const allData = [
            ...newsData.map(item => ({ ...item, category: 'news' })),
            ...pricesData.map(item => ({ ...item, category: 'price' })),
            ...schemesData.map(item => ({ ...item, category: 'scheme' }))
          ];
          
          // Sort and limit
          const sortedData = allData
            .sort((a, b) => {
              const dateA = new Date(a.created_at || a.date || a.createdAt);
              const dateB = new Date(b.created_at || b.date || b.createdAt);
              return dateB - dateA;
            })
            .slice(0, limitCount);
          
          callback(sortedData);
        };
      })();
      
      // Subscribe to all collections
      unsubscribers.push(subscribeToCollection('agricultural_news', 'news', (data) => combinedCallback('news', data), limitCount / 3));
      unsubscribers.push(subscribeToCollection('market_prices', 'price', (data) => combinedCallback('price', data), limitCount / 3));
      unsubscribers.push(subscribeToCollection('government_schemes', 'scheme', (data) => combinedCallback('scheme', data), limitCount / 3));
      
      // Return combined unsubscriber
      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    }
    
  } catch (error) {
    console.error('Error subscribing to news updates:', error);
    return () => {};
  }
};

/**
 * Helper function to subscribe to a specific collection
 */
const subscribeToCollection = (collectionName, category, callback, limitCount) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, firestoreLimit(limitCount * 2));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          category,
          // Normalize field names
          imageUrl: docData.imageUrl || docData.image_url || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
          created_at: docData.created_at || docData.createdAt || new Date().toISOString(),
          updated_at: docData.updated_at || docData.updatedAt || new Date().toISOString(),
          is_active: docData.is_active !== false,
          
          // Ensure title and summary have proper structure
          title: docData.title || {
            en: docData.title_en || docData.name || 'No title available',
            hi: docData.title_hi || 'शीर्षक उपलब्ध नहीं',
            te: docData.title_te || 'శీర్షిక అందుబాటులో లేదు'
          },
          summary: docData.summary || {
            en: docData.summary_en || docData.description || 'No summary available',
            hi: docData.summary_hi || 'सारांश उपलब्ध नहीं',
            te: docData.summary_te || 'సారాంశం అందుబాటులో లేదు'
          },
          
          // Ensure other required fields
          source: docData.source || 'Unknown Source',
          url: docData.url || '#',
          date: docData.date || docData.created_at || docData.createdAt || new Date().toISOString()
        };
      });
      
      // Filter and sort
      const filteredData = data
        .filter(item => item.is_active !== false)
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.date || a.createdAt);
          const dateB = new Date(b.created_at || b.date || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, limitCount);
      
      console.log(`Real-time update: ${filteredData.length} ${category} items`);
      callback(filteredData);
    }, (error) => {
      console.error(`Error in ${collectionName} subscription:`, error);
      callback([]);
    });
    
    return unsubscribe;
    
  } catch (error) {
    console.error(`Error subscribing to ${collectionName}:`, error);
    return () => {};
  }
};

/**
 * Get latest market prices from Firestore
 */
export const getLatestMarketPricesFromFirestore = async (limitCount = 10) => {
  try {
    return await getNewsByCategoryFromFirestore('price', limitCount);
  } catch (error) {
    console.error('Error getting market prices from Firestore:', error);
    return [];
  }
};

/**
 * Get latest government schemes from Firestore
 */
export const getLatestGovernmentSchemesFromFirestore = async (limitCount = 10) => {
  try {
    return await getNewsByCategoryFromFirestore('scheme', limitCount);
  } catch (error) {
    console.error('Error getting government schemes from Firestore:', error);
    return [];
  }
};