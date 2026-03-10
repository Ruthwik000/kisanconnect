/**
 * Chat Service
 * Handles text-based conversations with AI using Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_CHAT_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Clean and format the response text
 */
function cleanResponseText(text) {
  // Remove all asterisks used for bold/emphasis
  let cleaned = text.replace(/\*\*/g, '').replace(/\*/g, '');
  
  // Ensure proper spacing after periods
  cleaned = cleaned.replace(/\.([A-Z])/g, '. $1');
  
  // Ensure proper spacing around emojis
  cleaned = cleaned.replace(/([^\s])([🌱🌾💧🌤️🌡️👋🔍🦠📊💊🛡️📈⚠️✨🎯💡🌿🍃🌸🌺🌻🌼🌷🌹🥀🏵️🌴🌳🌲🎄🎋🎍🌵🌾🌿☘️🍀🍁🍂🍃])/g, '$1 $2');
  cleaned = cleaned.replace(/([🌱🌾💧🌤️🌡️👋🔍🦠📊💊🛡️📈⚠️✨🎯💡🌿🍃🌸🌺🌻🌼🌷🌹🥀🏵️🌴🌳🌲🎄🎋🎍🌵🌾🌿☘️🍀🍁🍂🍃])([^\s])/g, '$1 $2');
  
  // Remove excessive line breaks (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Send a chat message to Gemini and get a response
 * @param {string} message - User's message
 * @param {string} language - Language code (en, hi, te)
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} - Chat response with message and suggestions
 */
export const sendChatMessage = async (message, language = 'en', conversationHistory = []) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  try {
    const systemPrompt = buildChatSystemPrompt(language);
    
    // Build conversation contents
    const contents = [];
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    
    // Add current message with system context
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
    });

    const response = await fetch(`${GEMINI_CHAT_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    console.log('Gemini Chat API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini Chat API error:', errorData);
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No response from Gemini Chat API');
    }

    // Clean the response text
    const cleanedText = cleanResponseText(responseText);

    // Generate contextual suggestions based on the response
    const suggestions = generateSuggestions(message, cleanedText, language);

    return {
      success: true,
      message: cleanedText,
      suggestions: suggestions,
    };
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    throw error;
  }
};

/**
 * Build system prompt for chat based on language
 */
function buildChatSystemPrompt(language) {
  const prompts = {
    en: `You are an expert agricultural AI assistant specializing in cotton farming. Your role is to help farmers with:
- Cotton disease identification and treatment
- Crop management and best practices
- Pest control and prevention
- Irrigation and fertilization advice
- Weather-related farming decisions
- Soil health and crop rotation
- Harvest timing and techniques

CRITICAL FORMATTING RULES:
1. NEVER use asterisks (*) for emphasis or formatting
2. Use emojis naturally within sentences for visual appeal
3. Use proper line breaks for readability (double line break between sections)
4. Write in clear, conversational paragraphs
5. Use simple bullet points with emojis instead of asterisks (e.g., "🌱 Point one")
6. Keep responses warm, friendly, and easy to understand
7. Provide practical, actionable advice
8. Use temperature ranges, measurements, and specific details
9. Structure longer responses with clear sections separated by blank lines

EXAMPLE GOOD FORMAT:
Hey there! 👋 The best time to plant cotton is usually when your soil temperature consistently reaches 60-65°F (15-18°C) at a 2-4 inch depth for several consecutive days. 🌡️

This typically falls between late March and mid-May in many cotton-growing regions, depending on your specific location and local weather patterns. Make sure the risk of a late frost has passed too! 🌱

Here are some key tips:

🌾 Soil Preparation
Make sure your soil is well-drained and has good organic matter content.

💧 Moisture Levels  
The soil should be moist but not waterlogged at planting time.

🌤️ Weather Watch
Monitor local weather forecasts for any unexpected cold snaps.

Would you like more specific advice for your region?

AVOID THIS FORMAT:
**Hey there!** The best time is **60-65°F**
- Point one
- Point two
**Section Title**

Provide practical, actionable advice in a friendly and supportive tone. Keep responses concise but informative.`,
    
    hi: `आप कपास की खेती में विशेषज्ञता रखने वाले एक कृषि AI सहायक हैं। आपकी भूमिका किसानों की मदद करना है:
- कपास की बीमारियों की पहचान और उपचार
- फसल प्रबंधन और सर्वोत्तम प्रथाएं
- कीट नियंत्रण और रोकथाम
- सिंचाई और उर्वरक सलाह
- मौसम से संबंधित खेती के निर्णय
- मिट्टी का स्वास्थ्य और फसल चक्र
- कटाई का समय और तकनीक

महत्वपूर्ण फॉर्मेटिंग नियम:
1. जोर देने के लिए कभी भी तारांकन (*) का उपयोग न करें
2. वाक्यों में स्वाभाविक रूप से इमोजी का उपयोग करें
3. पठनीयता के लिए उचित लाइन ब्रेक का उपयोग करें
4. स्पष्ट, संवादात्मक पैराग्राफ में लिखें
5. तारांकन के बजाय इमोजी के साथ सरल बुलेट पॉइंट का उपयोग करें
6. प्रतिक्रियाओं को गर्म, मैत्रीपूर्ण और समझने में आसान रखें
7. व्यावहारिक, कार्रवाई योग्य सलाह दें

हिंदी में स्पष्ट और सरल भाषा में जवाब दें।`,
    
    te: `మీరు పత్తి వ్యవసాయంలో నైపుణ్యం కలిగిన వ్యవసాయ AI సహాయకుడు. రైతులకు సహాయం చేయడం మీ పాత్ర:
- పత్తి వ్యాధుల గుర్తింపు మరియు చికిత్స
- పంట నిర్వహణ మరియు ఉత్తమ పద్ధతులు
- పురుగుల నియంత్రణ మరియు నివారణ
- నీటిపారుదల మరియు ఎరువుల సలహా
- వాతావరణ సంబంధిత వ్యవసాయ నిర్ణయాలు
- నేల ఆరోగ్యం మరియు పంట మార్పిడి
- కోత సమయం మరియు పద్ధతులు

ముఖ్యమైన ఫార్మాటింగ్ నియమాలు:
1. నొక్కి చెప్పడానికి ఎప్పుడూ నక్షత్రాలు (*) ఉపయోగించవద్దు
2. వాక్యాలలో సహజంగా ఎమోజీలను ఉపయోగించండి
3. చదవడానికి సరైన లైన్ బ్రేక్‌లను ఉపయోగించండి
4. స్పష్టమైన, సంభాషణ పేరాగ్రాఫ్‌లలో వ్రాయండి
5. నక్షత్రాలకు బదులుగా ఎమోజీలతో సాధారణ బుల్లెట్ పాయింట్లను ఉపయోగించండి
6. స్పందనలను వెచ్చగా, స్నేహపూర్వకంగా మరియు అర్థం చేసుకోవడానికి సులభంగా ఉంచండి
7. ఆచరణాత్మక సలహా ఇవ్వండి

తెలుగులో స్పష్టమైన మరియు సరళమైన భాషలో సమాధానం ఇవ్వండి।`
  };

  return prompts[language] || prompts.en;
}

/**
 * Generate contextual follow-up suggestions
 */
function generateSuggestions(userMessage, botResponse, language) {
  const suggestions = {
    en: [
      'Tell me more about prevention',
      'What are the symptoms?',
      'How do I treat this?',
      'When should I apply treatment?',
    ],
    hi: [
      'रोकथाम के बारे में और बताएं',
      'लक्षण क्या हैं?',
      'इसका इलाज कैसे करें?',
      'उपचार कब लागू करें?',
    ],
    te: [
      'నివారణ గురించి మరింత చెప్పండి',
      'లక్షణాలు ఏమిటి?',
      'దీనికి చికిత్స ఎలా చేయాలి?',
      'చికిత్స ఎప్పుడు వర్తింపజేయాలి?',
    ],
  };

  return suggestions[language] || suggestions.en;
}

/**
 * Check if Gemini API is configured
 */
export const isChatConfigured = () => {
  return GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
};

/**
 * Test Gemini API connection
 */
export const testChatConnection = async () => {
  if (!isChatConfigured()) {
    return false;
  }

  try {
    const response = await fetch(`${GEMINI_CHAT_URL}?key=${GEMINI_API_KEY}`, {
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
    console.error('Chat connection test failed:', error);
    return false;
  }
};
