/**
 * Profile Service
 * Fetches user statistics and activity data for profile page
 */

import { getUserDiseaseStats } from '@/features/disease-detection/services/diseaseFirestoreService';
import { getUserConversationsFromFirestore } from '@/features/chat/services/chatFirestoreService';

/**
 * Get comprehensive user statistics for profile
 */
export const getUserStats = async (userId) => {
  try {
    console.log(`Getting user stats for ${userId}`);
    
    const [
      diseaseStats,
      conversations
    ] = await Promise.all([
      getUserDiseaseStats(userId),
      getUserConversationsFromFirestore(userId, 10)
    ]);

    // Calculate additional stats
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((total, conv) => total + (conv.messages?.length || 0), 0);
    
    // Get most recent activity
    const lastScanDate = diseaseStats.recentDetections?.[0]?.createdAt;
    const lastChatDate = conversations?.[0]?.updatedAt;
    
    const lastActivity = [lastScanDate, lastChatDate]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

    // Calculate this month's activity
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthScans = diseaseStats.recentDetections?.filter(
      detection => new Date(detection.createdAt) >= thisMonth
    ).length || 0;
    
    const thisMonthChats = conversations.filter(
      conv => new Date(conv.updatedAt) >= thisMonth
    ).length || 0;

    return {
      // Disease detection stats
      totalScans: diseaseStats.totalDetections || 0,
      healthyPlants: diseaseStats.healthyPlants || 0,
      diseasedPlants: diseaseStats.diseasedPlants || 0,
      thisMonthScans,
      
      // Chat stats
      totalConversations,
      totalMessages,
      thisMonthChats,
      
      // Activity
      lastActivity,
      
      // Most common diseases
      commonDiseases: diseaseStats.commonDiseases || {},
      
      // Recent activity
      recentDetections: diseaseStats.recentDetections?.slice(0, 3) || [],
      recentConversations: conversations.slice(0, 3),
      
      // News engagement (placeholder for future implementation)
      newsViewed: 0,
      
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      totalScans: 0,
      healthyPlants: 0,
      diseasedPlants: 0,
      thisMonthScans: 0,
      totalConversations: 0,
      totalMessages: 0,
      thisMonthChats: 0,
      lastActivity: null,
      commonDiseases: {},
      recentDetections: [],
      recentConversations: [],
      newsViewed: 0,
      lastUpdated: new Date()
    };
  }
};

/**
 * Get user's farming insights based on their data
 */
export const getUserInsights = (userStats) => {
  const insights = [];
  
  // Scan frequency insight
  if (userStats.totalScans > 0) {
    const healthyPercentage = Math.round((userStats.healthyPlants / userStats.totalScans) * 100);
    if (healthyPercentage >= 80) {
      insights.push({
        type: 'positive',
        title: 'Healthy Crops',
        message: `${healthyPercentage}% of your scanned crops are healthy!`
      });
    } else if (healthyPercentage < 50) {
      insights.push({
        type: 'warning',
        title: 'Crop Health Alert',
        message: `Only ${healthyPercentage}% of scanned crops are healthy. Consider preventive measures.`
      });
    }
  }
  
  // Activity insight
  if (userStats.thisMonthScans > 5) {
    insights.push({
      type: 'positive',
      title: 'Active Monitoring',
      message: `You've scanned ${userStats.thisMonthScans} crops this month. Great job staying vigilant!`
    });
  }
  
  // Chat engagement insight
  if (userStats.totalMessages > 20) {
    insights.push({
      type: 'info',
      title: 'AI Assistant User',
      message: `You've exchanged ${userStats.totalMessages} messages with our AI assistant.`
    });
  }
  
  // Common disease insight
  const topDisease = Object.entries(userStats.commonDiseases)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topDisease && topDisease[1] > 2) {
    insights.push({
      type: 'warning',
      title: 'Common Issue',
      message: `${topDisease[0]} detected ${topDisease[1]} times. Consider preventive treatment.`
    });
  }
  
  return insights;
};

/**
 * Format last activity date for display
 */
export const formatLastActivity = (lastActivity) => {
  if (!lastActivity) return 'No recent activity';
  
  const date = new Date(lastActivity);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};