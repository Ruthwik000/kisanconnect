import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Models prioritized for reliability
const MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.0-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-flash"
];

let modelIndex = 0;
const retryDelays = [2000, 5000, 10000];

/**
 * Generates a local fallback response if all AI models fail.
 * Ensures the user always receives a meaningful farming answer.
 */
const generateLocalFallback = (message, lang) => {
    const fallbacks = {
        en: "I'm currently having trouble connecting to the AI brain, but here is a general tip: Ensure your soil has proper drainage and use organic fertilizers for better yield. Please try again in a minute for a more specific answer.",
        hi: "मुझे अभी AI से जुड़ने में समस्या हो रही है, लेकिन एक सामान्य सुझाव है: बेहतर उपज के लिए अपनी मिट्टी में उचित जल निकासी सुनिश्चित करें और जैविक उर्वरकों का उपयोग करें। कृपया अधिक विशिष्ट उत्तर के लिए एक मिनट में पुनः प्रयास करें।",
        te: "నేను ప్రస్తుతం AIకి కనెక్ట్ చేయడంలో ఇబ్బంది పడుతున్నాను, కానీ ఇక్కడ ఒక సాధారణ చిట్కా ఉంది: మెరుగైన దిగుబడి కోసం మీ నేలలో సరైన నీటి పారుదల ఉండేలా చూసుకోండి మరియు సేంద్రీయ ఎరువులను ఉపయోగించండి. మరింత స్పష్టమైన సమాధానం కోసం దయచేసి ఒక నిమిషం తర్వాత మళ్లీ ప్రయత్నించండి."
    };
    return fallbacks[lang] || fallbacks.en;
};

/**
 * Requirement: Update AI Chat to handle failures gracefully using @google/genai
 * - Switch to another available model on failure
 * - Retry with delay (2s, 5s, 10s)
 * - Local fallback logic if all models fail
 */
export const sendChatMessage = async (message, uiLanguage, retryCount = 0) => {
    const currentModelName = MODELS[modelIndex % MODELS.length];
    console.log(`[AIChatbotService] Attempting with model: ${currentModelName} (Attempt ${retryCount + 1})`);

    try {
        const systemInstruction = `You are an agricultural assistant for farmers. 
Always reply ONLY in the language provided in the variable selectedLanguage. 
If selectedLanguage = 'hi', respond entirely in pure Hindi (Devanagari). 
If selectedLanguage = 'te', respond entirely in pure Telugu.
Format: concise points, plain text only. Max 3-5 lines.`;

        // Using @google/genai style generation
        const response = await ai.models.generateContent({
            model: currentModelName,
            contents: [
                { role: "system", parts: [{ text: systemInstruction }] },
                {
                    role: "user",
                    parts: [{ text: `selectedLanguage: ${uiLanguage}. Question: ${message}` }]
                }
            ]
        });

        const text = response.text;

        if (!text) throw new Error("Empty response");

        // Success: reset model index (optional, could stick to working one)
        return {
            reply: text,
            suggestions: getSuggestions(uiLanguage),
            model: currentModelName,
            isSuccess: true
        };

    } catch (error) {
        console.error(`[AIChatbotService] Model ${currentModelName} failed:`, error);

        if (retryCount < retryDelays.length) {
            // Switch model on every retry to find a working one
            modelIndex++;
            const waitTime = retryDelays[retryCount];
            console.log(`[AIChatbotService] Retrying in ${waitTime}ms with a different model...`);

            await new Promise(res => setTimeout(res, waitTime));
            return sendChatMessage(message, uiLanguage, retryCount + 1);
        }

        // Final Fallback: Local Logic
        console.warn("[AIChatbotService] All models and retries failed. Using local fallback.");
        return {
            reply: generateLocalFallback(message, uiLanguage),
            suggestions: getSuggestions(uiLanguage),
            isLocal: true,
            isSuccess: false,
            isBusy: true // For UI potential handling
        };
    }
};

const getSuggestions = (lang) => {
    const suggestionsDict = {
        en: ["🌾 Soil preparation", "🌱 Best seeds", "🛡️ Pest control", "☁️ Weather"],
        hi: ["🌾 मिट्टी की तैयारी", "🌱 बेहतर बीज", "🛡️ कीट नियंत्रण", "☁️ मौसम"],
        te: ["🌾 నేల తయారీ", "🌱 ఉత్తమ విత్తనాలు", "🛡️ తెగుళ్ల నివారణ", "☁️ వాతావరణం"]
    };
    return suggestionsDict[lang] || suggestionsDict.en;
};

export const detectLanguage = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    const teluguRegex = /[\u0C00-\u0C7F]/;
    if (hindiRegex.test(text)) return 'hi';
    if (teluguRegex.test(text)) return 'te';
    return 'en';
};
