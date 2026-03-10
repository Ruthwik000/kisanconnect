/**
 * Disease Detection Firestore Service
 * Manages disease detection history storage and retrieval from Firestore
 */

import { 
  collection, 
  doc, 
  addDoc,
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

const COLLECTION_NAME = 'disease_detections';

/**
 * Save disease detection result to Firestore
 */
export const saveDiseaseDetectionToFirestore = async (userId, detectionData) => {
  try {
    console.log(`Saving disease detection for user ${userId}`);
    
    const detectionRecord = {
      userId,
      imageUrl: detectionData.imageUrl,
      disease: detectionData.disease,
      confidence: detectionData.confidence || 0,
      isHealthy: detectionData.isHealthy || false,
      severity: detectionData.severity || null,
      recommendations: detectionData.recommendations || '',
      method: detectionData.method || 'gemini_vision',
      language: detectionData.language || 'en',
      location: detectionData.location || null,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), detectionRecord);
    console.log(`Disease detection saved with ID: ${docRef.id}`);
    
    return {
      success: true,
      detectionId: docRef.id
    };
  } catch (error) {
    console.error('Error saving disease detection to Firestore:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Get user's disease detection history from Firestore (simplified query)
 */
export const getUserDiseaseDetectionsFromFirestore = async (userId, limitCount = 50) => {
  try {
    console.log(`Getting disease detections for user ${userId}`);
    
    // Use simple query without orderBy to avoid compound index requirement
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      limit(limitCount * 2) // Get more to sort on client side
    );

    const querySnapshot = await getDocs(q);
    const detections = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      detections.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to JavaScript Date
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    // Sort on client side and limit
    const sortedDetections = detections
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limitCount);

    console.log(`Found ${sortedDetections.length} disease detections for user ${userId}`);
    return sortedDetections;
  } catch (error) {
    console.error('Error getting user disease detections:', error);
    return [];
  }
};

/**
 * Get disease detection statistics for a user
 */
export const getUserDiseaseStats = async (userId) => {
  try {
    const detections = await getUserDiseaseDetectionsFromFirestore(userId, 1000);
    
    const stats = {
      totalDetections: detections.length,
      healthyPlants: detections.filter(d => d.isHealthy).length,
      diseasedPlants: detections.filter(d => !d.isHealthy).length,
      commonDiseases: {},
      recentDetections: detections.slice(0, 5),
      detectionsByMonth: {}
    };

    // Count common diseases
    detections.forEach(detection => {
      if (!detection.isHealthy && detection.disease) {
        stats.commonDiseases[detection.disease] = (stats.commonDiseases[detection.disease] || 0) + 1;
      }
    });

    // Group detections by month
    detections.forEach(detection => {
      const month = detection.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      stats.detectionsByMonth[month] = (stats.detectionsByMonth[month] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting disease stats:', error);
    return {
      totalDetections: 0,
      healthyPlants: 0,
      diseasedPlants: 0,
      commonDiseases: {},
      recentDetections: [],
      detectionsByMonth: {}
    };
  }
};

/**
 * Search disease detections by disease name or recommendations
 */
export const searchUserDiseaseDetections = async (userId, searchTerm) => {
  try {
    const detections = await getUserDiseaseDetectionsFromFirestore(userId, 200);
    
    const searchLower = searchTerm.toLowerCase();
    const filteredDetections = detections.filter(detection => 
      detection.disease.toLowerCase().includes(searchLower) ||
      detection.recommendations.toLowerCase().includes(searchLower)
    );

    return filteredDetections;
  } catch (error) {
    console.error('Error searching disease detections:', error);
    return [];
  }
};

/**
 * Get disease detections by health status (simplified query)
 */
export const getDiseaseDetectionsByHealth = async (userId, isHealthy = false) => {
  try {
    console.log(`Getting ${isHealthy ? 'healthy' : 'diseased'} detections for user ${userId}`);
    
    // Use simple query without orderBy to avoid compound index requirement
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isHealthy', '==', isHealthy),
      limit(100) // Get more to sort on client side
    );

    const querySnapshot = await getDocs(q);
    const detections = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      detections.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });

    // Sort on client side
    const sortedDetections = detections
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);

    console.log(`Found ${sortedDetections.length} ${isHealthy ? 'healthy' : 'diseased'} detections`);
    return sortedDetections;
  } catch (error) {
    console.error('Error getting detections by health status:', error);
    return [];
  }
};