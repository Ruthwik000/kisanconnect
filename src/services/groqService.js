/**
 * Groq API Service
 * Provides LLM-powered cure recommendations for detected diseases
 * Now with VISION support for direct image analysis!
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Vision model for image analysis
const VISION_MODEL = 'llama-4-scout-17b-16e-instruct';

/**
 * Analyze cotton plant image directly using Groq Vision LLM
 * @param {File} imageFile - The image file to analyze
 * @param {string} language - Language code (en, hi, te)
 * @returns {Promise<Object>} - Analysis result with disease name and recommendations
 */
export const analyzePlantImageWithVision = async (imageFile, language = 'en') => {
  // Check if API key is configured
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    throw new Error('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file');
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    console.log('Image converted to base64, length:', base64Image.length);
    console.log('Using model:', VISION_MODEL);
    
    const prompt = buildVisionPrompt(language);
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
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

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No response from Groq Vision API');
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
      method: 'vision_llm',
    };
  } catch (error) {
    console.error('Groq Vision API error:', error);
    throw error;
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
   - If diseased: Identify the specific disease (e.g., Bacterial Blight, Fusarium Wilt, Alternaria Leaf Spot, etc.)
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
 * Check if Groq API is configured
 * @returns {boolean}
 */
export const isGroqConfigured = () => {
  return GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';
};

/**
 * Test Groq API connection
 * @returns {Promise<boolean>}
 */
export const testGroqConnection = async () => {
  if (!isGroqConfigured()) {
    return false;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
        max_tokens: 10,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Groq connection test failed:', error);
    return false;
  }
};
