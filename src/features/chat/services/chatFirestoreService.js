/**
 * Chat Firestore Service
 * Manages chat conversation storage and retrieval from Firestore
 */

import { 
  collection, 
  doc, 
  addDoc,
  getDocs, 
  getDoc,
  setDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

const COLLECTION_NAME = 'chat_conversations';

/**
 * Save a new chat conversation to Firestore
 */
export const saveConversationToFirestore = async (userId, messages, language = 'en', topic = null) => {
  try {
    console.log(`Saving conversation for user ${userId} with ${messages.length} messages`);
    
    const conversationData = {
      userId,
      messages: messages.map(msg => ({
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || serverTimestamp(),
        language: msg.language || language,
        suggestions: msg.suggestions || []
      })),
      language,
      topic,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), conversationData);
    console.log(`Conversation saved with ID: ${docRef.id}`);
    
    return {
      success: true,
      conversationId: docRef.id
    };
  } catch (error) {
    console.error('Error saving conversation to Firestore:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update an existing conversation with new messages
 */
export const updateConversationInFirestore = async (conversationId, newMessages) => {
  try {
    console.log(`Updating conversation ${conversationId} with ${newMessages.length} new messages`);
    
    const conversationRef = doc(db, COLLECTION_NAME, conversationId);
    
    // Get current conversation
    const currentConversation = await getDoc(conversationRef);
    if (!currentConversation.exists()) {
      throw new Error('Conversation not found');
    }
    
    const currentData = currentConversation.data();
    const updatedMessages = [
      ...currentData.messages,
      ...newMessages.map(msg => ({
        id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || serverTimestamp(),
        language: msg.language || currentData.language,
        suggestions: msg.suggestions || []
      }))
    ];

    await setDoc(conversationRef, {
      ...currentData,
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log(`Conversation ${conversationId} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error updating conversation:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Get user's chat conversations from Firestore (simplified query)
 */
export const getUserConversationsFromFirestore = async (userId, limitCount = 20) => {
  try {
    console.log(`Getting conversations for user ${userId}`);
    
    // Use simple query without orderBy to avoid compound index requirement
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      limit(limitCount * 2) // Get more to sort on client side
    );

    const querySnapshot = await getDocs(q);
    const conversations = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        ...data,
        // Ensure updatedAt is a proper date
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    // Sort on client side and limit
    const sortedConversations = conversations
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limitCount);

    console.log(`Found ${sortedConversations.length} conversations for user ${userId}`);
    return sortedConversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    return [];
  }
};

/**
 * Get a specific conversation by ID
 */
export const getConversationById = async (conversationId) => {
  try {
    const conversationDoc = await getDoc(doc(db, COLLECTION_NAME, conversationId));
    
    if (conversationDoc.exists()) {
      return {
        id: conversationDoc.id,
        ...conversationDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

/**
 * Subscribe to real-time conversation updates
 */
export const subscribeToConversation = (conversationId, callback) => {
  try {
    const conversationRef = doc(db, COLLECTION_NAME, conversationId);
    
    return onSnapshot(conversationRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      }
    });
  } catch (error) {
    console.error('Error subscribing to conversation:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, conversationId));
    console.log(`Conversation ${conversationId} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Search conversations by content
 */
export const searchUserConversations = async (userId, searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - for production, consider using Algolia or similar
    const conversations = await getUserConversationsFromFirestore(userId, 100);
    
    const searchLower = searchTerm.toLowerCase();
    const filteredConversations = conversations.filter(conversation => {
      // Search in messages content
      return conversation.messages.some(message => 
        message.content.toLowerCase().includes(searchLower)
      ) || (conversation.topic && conversation.topic.toLowerCase().includes(searchLower));
    });

    return filteredConversations;
  } catch (error) {
    console.error('Error searching conversations:', error);
    return [];
  }
};