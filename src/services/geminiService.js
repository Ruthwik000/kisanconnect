/**
 * Google Gemini API Service
 * Provides Vision-based disease detection for cotton plants
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

/**
 * Analyze cotton plant image using Gemini Vision
 * @param {File} imageFile - The image file to analyze
 * @param {string} language - Language code (en, hi, te)
 * @returns {Promise<Object>} - Analysis result with disease name and recommendations
 */
export const analyzePlantImageWithGemini = async (imageFile, language = 'en') => {
  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  try {
    // Convert image to base64 (without data URL prefix)
    const base64Image = await fileToBase64WithoutPrefix(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';
    
    console.log('Image converted to base64, length:', base64Image.length);
    console.log('Using Gemini 3 Flash Preview model');
    
    const prompt = buildVisionPrompt(language);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 2048,
          topP: 0.95,
        },
      }),
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No response from Gemini Vision API');
    }

    console.log('Analysis text length:', analysisText.length);

    // Extract disease name and confidence from response
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
 * Convert File to base64 (without data URL prefix)
 */
async function fileToBase64WithoutPrefix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
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
  const basePrompt = `You are an expert agricultural pathologist specializing in cotton plant diseases. Analyze this cotton plant image and provide a detailed assessment.

**IMPORTANT: Start your response with this exact format:**
**Disease Status: [Healthy/Diseased]**
**Specific Disease: [Disease Name or "None - Plant is Healthy"]**
**Confidence: [0-100]%**

Then provide:

1. **Visual Assessment**: What you observe in the image (leaf color, spots, wilting, etc.)

2. **Disease Identification**: 
   - If diseased: Identify the specific disease (e.g., Bacterial Blight, Fusarium Wilt, Alternaria Leaf Spot, Cercospora Leaf Spot, Angular Leaf Spot, etc.)
   - If healthy: Confirm the plant's good health

3. **Symptoms Analysis**: Detailed description of visible symptoms

4. **Severity Level**: Rate as Mild, Moderate, or Severe (if diseased)

5. **Treatment Recommendations**:
   - Chemical treatments with specific product names and dosages
   - Organic/natural alternatives
   - Immediate actions needed

6. **Prevention Tips**: How to prevent this issue in the future

7. **Prognosis**: Expected outcome with proper treatment

Format your response clearly with emojis for better readability. Be specific and actionable.`;

  if (language === 'hi') {
    return basePrompt + '\n\n**Respond in Hindi (Devanagari script).**';
  } else if (language === 'te') {
    return basePrompt + '\n\n**Respond in Telugu script.**';
  }
  
  return basePrompt;
}

/**
 * Parse the vision model response to extract key information
 */
function parseVisionResponse(text) {
  // Extract disease status
  const statusMatch = text.match(/\*\*Disease Status:\s*([^*\n]+)\*\*/i);
  const status = statusMatch ? statusMatch[1].trim().toLowerCase() : '';
  const isHealthy = status.includes('healthy');

  // Extract specific disease name
  const diseaseMatch = text.match(/\*\*Specific Disease:\s*([^*\n]+)\*\*/i);
  let disease = diseaseMatch ? diseaseMatch[1].trim() : '';
  
  // Clean up disease name
  if (disease.toLowerCase().includes('none') || disease.toLowerCase().includes('healthy')) {
    disease = 'Healthy Cotton Plant';
  }

  // Extract confidence
  const confidenceMatch = text.match(/\*\*Confidence:\s*(\d+)%?\*\*/i);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.85;

  return {
    disease,
    confidence,
    isHealthy,
  };
}

/**
 * Check if Gemini API is configured
 * @returns {boolean}
 */
export const isGeminiConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
};

/**
 * Test Gemini API connection
 * @returns {Promise<boolean>}
 */
export const testGeminiConnection = async () => {
  if (!isGeminiConfigured()) {
    return false;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Hello',
              },
            ],
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};
