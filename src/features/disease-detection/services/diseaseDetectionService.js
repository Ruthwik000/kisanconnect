/**
 * Disease Detection Service
 * Handles cotton plant disease detection using Gemini and Groq Vision APIs
 */

import { saveDiseaseDetectionToFirestore } from './diseaseFirestoreService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_VISION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
const GROQ_VISION_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_VISION_MODEL = 'llama-3.2-90b-vision-preview';

/**
 * Analyze cotton plant image using Gemini Vision
 * @param {File} imageFile - The image file to analyze
 * @param {string} language - Language code (en, hi, te)
 * @returns {Promise<Object>} - Analysis result with disease name and recommendations
 */
export const analyzePlantImageWithGemini = async (imageFile, language = 'en') => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  try {
    const base64Image = await fileToBase64WithoutPrefix(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';
    
    console.log('Analyzing with Gemini Vision...');
    
    const prompt = buildVisionPrompt(language);
    
    const response = await fetch(`${GEMINI_VISION_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No response from Gemini Vision API');
    }

    const result = parseVisionResponse(analysisText);

    return {
      success: true,
      disease: result.disease,
      confidence: result.confidence,
      isHealthy: result.isHealthy,
      fullAnalysis: analysisText,
      method: 'gemini_vision',
    };
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    throw error;
  }
};

/**
 * Analyze cotton plant image using Groq Vision
 * @param {File} imageFile - The image file to analyze
 * @param {string} language - Language code (en, hi, te)
 * @returns {Promise<Object>} - Analysis result with disease name and recommendations
 */
export const analyzePlantImageWithGroq = async (imageFile, language = 'en') => {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file');
  }

  try {
    const base64Image = await fileToBase64(imageFile);
    
    console.log('Analyzing with Groq Vision...');
    
    const prompt = buildVisionPrompt(language);
    
    const response = await fetch(GROQ_VISION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No response from Groq Vision API');
    }

    const result = parseVisionResponse(analysisText);

    return {
      success: true,
      disease: result.disease,
      confidence: result.confidence,
      isHealthy: result.isHealthy,
      fullAnalysis: analysisText,
      method: 'groq_vision',
    };
  } catch (error) {
    console.error('Groq Vision API error:', error);
    throw error;
  }
};

/**
 * Analyze plant image - tries Gemini first, falls back to Groq
 * @param {File} imageFile - The image file to analyze
 * @param {string} language - Language code (en, hi, te)
 * @param {string} userId - User ID for saving to history
 * @returns {Promise<Object>} - Analysis result
 */
export const analyzePlantImage = async (imageFile, language = 'en', userId = null) => {
  try {
    // Try Gemini first
    const result = await analyzePlantImageWithGemini(imageFile, language);
    
    // Save to Firestore if userId is provided
    if (userId && result.success) {
      try {
        const imageBase64 = await fileToBase64(imageFile);
        await saveDiseaseDetectionToFirestore(userId, {
          disease: result.disease,
          confidence: result.confidence,
          isHealthy: result.isHealthy,
          fullAnalysis: result.fullAnalysis,
          method: result.method,
          language,
          imageData: imageBase64,
          imageSize: imageFile.size,
          imageName: imageFile.name
        });
        console.log('Scan history saved to Firestore');
      } catch (saveError) {
        console.error('Failed to save scan history:', saveError);
        // Don't throw error - analysis was successful
      }
    }
    
    return result;
  } catch (geminiError) {
    console.warn('Gemini failed, trying Groq:', geminiError.message);
    
    try {
      // Fallback to Groq
      const result = await analyzePlantImageWithGroq(imageFile, language);
      
      // Save to Firestore if userId is provided
      if (userId && result.success) {
        try {
          const imageBase64 = await fileToBase64(imageFile);
          await saveDiseaseDetectionToFirestore(userId, {
            disease: result.disease,
            confidence: result.confidence,
            isHealthy: result.isHealthy,
            fullAnalysis: result.fullAnalysis,
            method: result.method,
            language,
            imageData: imageBase64,
            imageSize: imageFile.size,
            imageName: imageFile.name
          });
          console.log('Scan history saved to Firestore');
        } catch (saveError) {
          console.error('Failed to save scan history:', saveError);
        }
      }
      
      return result;
    } catch (groqError) {
      console.error('Both APIs failed:', { geminiError, groqError });
      throw new Error('Unable to analyze image. Please check your API keys and try again.');
    }
  }
};

/**
 * Convert File to base64 data URL
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert File to base64 (without data URL prefix)
 */
async function fileToBase64WithoutPrefix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Build the vision prompt for cotton plant analysis
 */
function buildVisionPrompt(language) {
  const basePrompt = `You are an expert agricultural pathologist. Analyze this cotton plant and provide COMPLETE treatment details with exact medications and dosages.

FORMAT (No asterisks/dashes in content):

Disease Status: [Healthy/Diseased]
Specific Disease: [Name]
Confidence: [0-100]%


🔍 Visual Assessment
Describe symptoms: spots, color, size, location, texture.


🦠 Disease Details
Name disease, pathogen type, how it spreads.


📊 Severity: [Mild/Moderate/Severe]


💊 TREATMENT (MUST COMPLETE ALL 3 OPTIONS)

OPTION 1: [Product Name - e.g., Mancozeb 75% WP]
Active Ingredient: [Chemical]
Dosage: [X grams per liter OR X kg per acre]
Mix: [How to prepare]
Apply: [Spray method, timing]
Frequency: [Every X days, X times]
Duration: [X weeks]
Water: [Liters per acre]
Cost: [Rs. X-Y per acre]

OPTION 2: [Product Name - e.g., Copper Oxychloride]
Active Ingredient: [Chemical]
Dosage: [Exact amount]
Mix: [Preparation]
Apply: [Method]
Frequency: [Schedule]
Duration: [Period]
Cost: [Price]

OPTION 3: [Product Name - e.g., Carbendazim]
Active Ingredient: [Chemical]
Dosage: [Exact amount]
Mix: [Preparation]
Apply: [Method]
Frequency: [Schedule]
Cost: [Price]

ORGANIC OPTIONS:

1. [Natural remedy]: [Ingredients with amounts], [Preparation], [Application]
2. [Second remedy]: [Details]

IMMEDIATE ACTIONS:
1. [Action]
2. [Action]
3. [Action]


🛡️ Prevention
1. [Practice]
2. [Practice]
3. [Practice]
4. [Practice]


📈 Recovery
Time: [X weeks]
Yield Impact: [Percentage]
Success Rate: [Percentage]


⚠️ Warnings
[Critical notes]


CRITICAL: Complete ALL treatment options with REAL Indian product names and EXACT dosages. Do not stop until all sections are complete.`;

  if (language === 'hi') {
    return basePrompt + '\n\nहिंदी में पूरा जवाब दें। सभी दवाओं के नाम और मात्रा बताएं।';
  } else if (language === 'te') {
    return basePrompt + '\n\nతెలుగులో పూర్తి సమాధానం ఇవ్వండి। అన్ని మందుల వివరాలు ఇవ్వండి।';
  }
  
  return basePrompt;
}

/**
 * Parse the vision model response to extract key information
 */
function parseVisionResponse(text) {
  const statusMatch = text.match(/Disease Status:\s*([^\n]+)/i);
  const status = statusMatch ? statusMatch[1].trim().toLowerCase() : '';
  const isHealthy = status.includes('healthy');

  const diseaseMatch = text.match(/Specific Disease:\s*([^\n]+)/i);
  let disease = diseaseMatch ? diseaseMatch[1].trim() : '';
  
  if (disease.toLowerCase().includes('none') || disease.toLowerCase().includes('healthy')) {
    disease = 'Healthy Cotton Plant';
  }

  const confidenceMatch = text.match(/Confidence:\s*(\d+)%?/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.85;

  return {
    disease,
    confidence,
    isHealthy,
  };
}

/**
 * Check if APIs are configured
 */
export const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
};

export const isGroqConfigured = () => {
  return GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';
};

/**
 * Get severity color for UI display
 */
export const getSeverityColor = (severity) => {
  const colors = {
    critical: '#ef4444',
    moderate: '#f59e0b',
    mild: '#eab308',
    healthy: '#22c55e',
    unknown: '#6b7280'
  };
  return colors[severity?.toLowerCase()] || colors.unknown;
};

/**
 * Get severity icon
 */
export const getSeverityIcon = (severity) => {
  const icons = {
    critical: 'alert-circle',
    moderate: 'alert-triangle',
    mild: 'info',
    healthy: 'check-circle',
    unknown: 'help-circle'
  };
  return icons[severity?.toLowerCase()] || icons.unknown;
};

/**
 * Format confidence as percentage
 */
export const formatConfidence = (confidence) => {
  return `${(confidence * 100).toFixed(1)}%`;
};
