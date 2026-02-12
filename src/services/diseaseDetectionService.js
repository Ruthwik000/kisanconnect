const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

class DiseaseDetectionService {
  /**
   * Check if ML API is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${ML_API_URL}/health`);
      if (!response.ok) {
        throw new Error('ML API is not available');
      }
      return await response.json();
    } catch (error) {
      console.error('ML API health check failed:', error);
      throw error;
    }
  }

  /**
   * Get available disease classes
   */
  async getClasses() {
    try {
      const response = await fetch(`${ML_API_URL}/classes`);
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get classes:', error);
      throw error;
    }
  }

  /**
   * Predict disease from image file
   * @param {File} imageFile - The image file to analyze
   * @returns {Promise<Object>} Prediction results
   */
  async predictDisease(imageFile) {
    try {
      // Validate file
      if (!imageFile) {
        throw new Error('No image file provided');
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', imageFile);

      // Send request
      const response = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Prediction failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Disease prediction failed:', error);
      throw error;
    }
  }

  /**
   * Predict disease from image URL or base64
   * @param {string} imageUrl - URL or base64 data URL
   * @returns {Promise<Object>} Prediction results
   */
  async predictFromUrl(imageUrl) {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Convert to File
      const file = new File([blob], 'image.jpg', { type: blob.type });
      
      // Use the main predict method
      return await this.predictDisease(file);
    } catch (error) {
      console.error('Failed to predict from URL:', error);
      throw error;
    }
  }

  /**
   * Get severity color for UI display
   * @param {string} severity - Severity level
   * @returns {string} Color class or hex code
   */
  getSeverityColor(severity) {
    const colors = {
      critical: '#ef4444', // red
      moderate: '#f59e0b', // orange
      mild: '#eab308',     // yellow
      healthy: '#22c55e',  // green
      unknown: '#6b7280'   // gray
    };
    return colors[severity?.toLowerCase()] || colors.unknown;
  }

  /**
   * Get severity icon
   * @param {string} severity - Severity level
   * @returns {string} Icon name
   */
  getSeverityIcon(severity) {
    const icons = {
      critical: 'alert-circle',
      moderate: 'alert-triangle',
      mild: 'info',
      healthy: 'check-circle',
      unknown: 'help-circle'
    };
    return icons[severity?.toLowerCase()] || icons.unknown;
  }

  /**
   * Format confidence as percentage
   * @param {number} confidence - Confidence value (0-1)
   * @returns {string} Formatted percentage
   */
  formatConfidence(confidence) {
    return `${(confidence * 100).toFixed(1)}%`;
  }
}

export default new DiseaseDetectionService();
