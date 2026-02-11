/**
 * Disease Cure Knowledge Base
 * Provides treatment recommendations based on detected diseases
 */

const diseaseCureDatabase = {
  'diseased cotton leaf': {
    name: 'Diseased Cotton Leaf',
    severity: 'moderate',
    symptoms: [
      'Discoloration or spots on leaves',
      'Yellowing or browning of leaf tissue',
      'Wilting or curling of leaves',
      'Reduced photosynthesis capacity'
    ],
    causes: [
      'Fungal infections (e.g., Alternaria leaf spot)',
      'Bacterial blight',
      'Nutrient deficiency',
      'Environmental stress'
    ],
    treatment: [
      'Remove and destroy infected leaves immediately',
      'Apply fungicide spray (Mancozeb or Copper oxychloride)',
      'Ensure proper spacing between plants for air circulation',
      'Avoid overhead irrigation to reduce leaf wetness',
      'Apply balanced NPK fertilizer to strengthen plant immunity'
    ],
    prevention: [
      'Use disease-resistant cotton varieties',
      'Practice crop rotation with non-host crops',
      'Maintain field hygiene by removing plant debris',
      'Monitor regularly for early detection',
      'Ensure proper drainage to avoid waterlogging'
    ],
    organicRemedies: [
      'Neem oil spray (5ml per liter of water)',
      'Garlic extract solution as natural fungicide',
      'Trichoderma-based bio-fungicide',
      'Maintain soil health with compost and organic matter'
    ]
  },
  'diseased cotton plant': {
    name: 'Diseased Cotton Plant',
    severity: 'high',
    symptoms: [
      'Overall plant wilting and stunted growth',
      'Yellowing of entire plant',
      'Root rot or stem damage',
      'Reduced boll formation',
      'Plant death in severe cases'
    ],
    causes: [
      'Verticillium or Fusarium wilt',
      'Root rot diseases',
      'Severe pest infestation',
      'Systemic viral infections',
      'Poor soil conditions'
    ],
    treatment: [
      'Isolate infected plants to prevent spread',
      'Apply systemic fungicide (Carbendazim)',
      'Improve soil drainage immediately',
      'Apply bio-stimulants to boost plant recovery',
      'Consider removing severely infected plants',
      'Treat soil with Trichoderma before replanting'
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Treat seeds with fungicide before sowing',
      'Practice 3-4 year crop rotation',
      'Maintain optimal soil pH (6.0-7.5)',
      'Avoid planting in fields with disease history',
      'Use drip irrigation instead of flood irrigation'
    ],
    organicRemedies: [
      'Pseudomonas fluorescens for biological control',
      'Vermicompost tea to improve soil microbiome',
      'Neem cake application in soil',
      'Bacillus subtilis-based bio-pesticide'
    ]
  },
  'fresh cotton leaf': {
    name: 'Healthy Cotton Leaf',
    severity: 'none',
    symptoms: [
      'Vibrant green color',
      'No spots or discoloration',
      'Proper leaf structure and turgidity',
      'Active photosynthesis'
    ],
    causes: [
      'Good agricultural practices',
      'Proper nutrition and water management',
      'Disease-free environment'
    ],
    treatment: [
      'No treatment needed - plant is healthy!',
      'Continue current management practices',
      'Monitor regularly to maintain health'
    ],
    prevention: [
      'Maintain balanced fertilization schedule',
      'Ensure adequate but not excessive watering',
      'Regular monitoring for early pest/disease detection',
      'Maintain field sanitation',
      'Use integrated pest management (IPM) practices'
    ],
    organicRemedies: [
      'Continue organic matter application',
      'Use bio-fertilizers for sustained nutrition',
      'Maintain beneficial insect populations'
    ]
  },
  'fresh cotton plant': {
    name: 'Healthy Cotton Plant',
    severity: 'none',
    symptoms: [
      'Vigorous growth and development',
      'Dark green foliage',
      'Good boll formation',
      'Strong stem and root system',
      'No signs of stress or disease'
    ],
    causes: [
      'Optimal growing conditions',
      'Proper crop management',
      'Good soil health',
      'Effective pest and disease control'
    ],
    treatment: [
      'No treatment required - excellent plant health!',
      'Continue your successful farming practices',
      'Maintain current care routine'
    ],
    prevention: [
      'Continue balanced NPK fertilization',
      'Maintain consistent irrigation schedule',
      'Regular field scouting for any issues',
      'Timely application of growth promoters',
      'Proper weed management'
    ],
    organicRemedies: [
      'Periodic application of compost tea',
      'Use of bio-stimulants for enhanced growth',
      'Maintain diverse beneficial microorganisms in soil'
    ]
  }
};

/**
 * Get cure information for a detected disease
 * @param {string} diseaseName - Name of the detected disease
 * @param {string} language - Language code (en, hi, te)
 * @returns {Object} - Detailed cure information
 */
export const getDiseaseCure = (diseaseName, language = 'en') => {
  const normalizedName = diseaseName.toLowerCase().trim();
  const diseaseInfo = diseaseCureDatabase[normalizedName];

  if (!diseaseInfo) {
    return {
      found: false,
      message: 'Disease information not found in our database. Please consult with an agricultural expert.',
    };
  }

  return {
    found: true,
    ...diseaseInfo,
  };
};

/**
 * Generate a conversational response about the disease and cure
 * @param {string} diseaseName - Name of the detected disease
 * @param {number} confidence - Confidence level of detection
 * @param {string} language - Language code
 * @returns {string} - Formatted response message
 */
export const generateCureResponse = (diseaseName, confidence, language = 'en') => {
  const cure = getDiseaseCure(diseaseName, language);
  
  if (!cure.found) {
    return `I detected something in your image, but I don't have specific information about "${diseaseName}" in my database. I recommend consulting with a local agricultural expert for proper diagnosis and treatment.`;
  }

  const confidencePercent = (confidence * 100).toFixed(1);
  
  if (cure.severity === 'none') {
    return `Great news! 🌱 I analyzed your cotton plant with ${confidencePercent}% confidence, and it appears to be healthy!\n\n✅ Your plant shows:\n${cure.symptoms.map(s => `• ${s}`).join('\n')}\n\n💡 To maintain this excellent health:\n${cure.prevention.slice(0, 3).map(p => `• ${p}`).join('\n')}\n\nKeep up the good work! Your plants are thriving.`;
  }

  let response = `⚠️ I've detected: ${cure.name}\n`;
  response += `Confidence: ${confidencePercent}%\n`;
  response += `Severity: ${cure.severity.toUpperCase()}\n\n`;
  
  response += `🔍 Common Symptoms:\n${cure.symptoms.slice(0, 3).map(s => `• ${s}`).join('\n')}\n\n`;
  
  response += `💊 Recommended Treatment:\n${cure.treatment.slice(0, 4).map(t => `• ${t}`).join('\n')}\n\n`;
  
  response += `🌿 Organic Alternatives:\n${cure.organicRemedies.slice(0, 3).map(r => `• ${r}`).join('\n')}\n\n`;
  
  response += `🛡️ Prevention Tips:\n${cure.prevention.slice(0, 3).map(p => `• ${p}`).join('\n')}\n\n`;
  
  response += `💬 Need more details? Ask me about specific treatments or prevention methods!`;
  
  return response;
};

/**
 * Get all available disease information
 * @returns {Array} - List of all diseases in database
 */
export const getAllDiseases = () => {
  return Object.keys(diseaseCureDatabase).map(key => ({
    id: key,
    name: diseaseCureDatabase[key].name,
    severity: diseaseCureDatabase[key].severity,
  }));
};
