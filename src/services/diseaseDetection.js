/**
 * Disease Detection Service
 * Handles communication with the Python FastAPI backend
 */

const API_URL = import.meta.env.VITE_DISEASE_API_URL || 'http://localhost:8000';

/**
 * Upload image to disease detection API
 * @param {File} imageFile - The image file to analyze
 * @returns {Promise<Object>} - Detection result with disease name and confidence
 */
export const detectDisease = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      disease: data.predicted_class,
      confidence: data.confidence,
      method: data.method,
      details: data,
    };
  } catch (error) {
    console.error('Disease detection error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if the disease detection API is available
 * @returns {Promise<boolean>}
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};
