// Agricultural AI Assistant using Groq API (Llama 3.3 70B)
// Context-aware chatbot for farmer assistance

import { AnalysisResult, Field } from './store';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  analysis?: AnalysisResult;
  field?: Field;
  weatherData?: {
    temp: number;
    description: string;
    humidity: number;
  };
  zoneSummary?: {
    totalZones: number;
    criticalZones: number;
    savings: number;
  };
}

// System prompt with agricultural expertise
const SYSTEM_PROMPT = `You are Talazo AI Assistant, an expert agricultural advisor for Zimbabwean farmers. You provide practical, actionable advice on crop health, disease management, nutrient deficiencies, and precision agriculture.

Key Guidelines:
1. Be concise and practical - farmers need actionable advice
2. Use simple, clear English language
3. Provide specific recommendations with rates (e.g., "Apply 200-300 kg/ha of urea")
4. Consider Zimbabwe's climate, seasons, and available products
5. Prioritize cost-effective and sustainable solutions
6. When analysis data is available, reference it specifically
7. Always emphasize safety with chemicals and proper PPE
8. Communicate ONLY in English for accuracy and consistency

Crops you specialize in: Tobacco, Maize, Wheat, Cotton, Potatoes, Tomatoes, Watermelons, Blueberries

You have access to:
- Real-time disease detection results (from Roboflow ML)
- Nutrient deficiency analysis (NPK levels)
- Weather data (temperature, rainfall, alerts)
- Precision agriculture zone maps
- Resource optimization calculations

Never make up information - if you don't know, recommend consulting a local extension officer.`;

// Build context-aware prompt
function buildContextPrompt(context: ChatContext): string {
  let contextInfo = '';

  if (context.analysis) {
    const { disease, nutrient, water, ndvi } = context.analysis;
    
    contextInfo += '\n\n📊 CURRENT ANALYSIS RESULTS:\n';
    
    // Disease information
    if (disease.detected) {
      contextInfo += `\n🔴 DISEASE DETECTED:
- Type: ${disease.type}
- Confidence: ${disease.confidence}%
- Affected Area: ${disease.affectedArea}%
- Severity: ${disease.severity.toUpperCase()}
- Recommendations: ${disease.recommendations.join('; ')}`;
    } else {
      contextInfo += '\n✅ No diseases detected - crop appears healthy';
    }

    // Nutrient information
    contextInfo += `\n\n🌱 NUTRIENT STATUS:
- Nitrogen (N): ${nutrient.nitrogen}%
- Phosphorus (P): ${nutrient.phosphorus}%
- Potassium (K): ${nutrient.potassium}%
- Primary Deficiency: ${nutrient.primaryDeficiency}
- Confidence: ${nutrient.confidence}%`;

    // Water stress
    contextInfo += `\n\n💧 WATER STATUS:
- Status: ${water.status}
- Soil Moisture: ${water.soilMoisture}%`;

    // NDVI
    contextInfo += `\n\n📈 VEGETATION HEALTH (NDVI):
- Average: ${ndvi.average.toFixed(2)}
- Healthy: ${ndvi.healthy}%
- Stressed: ${ndvi.stressed}%
- Trend: ${ndvi.trend}`;
  }

  if (context.field) {
    contextInfo += `\n\n🌾 FIELD INFORMATION:
- Name: ${context.field.name}
- Crop: ${context.field.cropType}
- Area: ${context.field.area} hectares
- Planting Date: ${context.field.plantingDate}
- Health Status: ${context.field.healthStatus || 'Unknown'}`;
  }

  if (context.zoneSummary) {
    contextInfo += `\n\n🗺️ PRECISION AGRICULTURE ANALYSIS:
- Total Zones: ${context.zoneSummary.totalZones}
- Critical Zones: ${context.zoneSummary.criticalZones}
- Estimated Savings: $${context.zoneSummary.savings.toFixed(2)}`;
  }

  if (context.weatherData) {
    contextInfo += `\n\n🌤️ WEATHER CONDITIONS:
- Temperature: ${context.weatherData.temp}°C
- Conditions: ${context.weatherData.description}
- Humidity: ${context.weatherData.humidity}%`;
  }

  return contextInfo;
}

// Send message to Groq API
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  context?: ChatContext
): Promise<{ response: string; error?: string }> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return {
      response: '',
      error: 'Groq API key not configured. Please add your Groq API key to use the AI assistant.',
    };
  }

  try {
    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      systemPrompt += buildContextPrompt(context);
    }

    // Prepare messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return { response: assistantMessage };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      response: '',
      error: error instanceof Error ? error.message : 'Failed to get response from AI assistant',
    };
  }
}

// Streaming response for faster perceived performance (optional enhancement)
export async function sendChatMessageStreaming(
  message: string,
  conversationHistory: ChatMessage[],
  onChunk: (chunk: string) => void,
  context?: ChatContext
): Promise<{ error?: string }> {
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
    return {
      error: 'Groq API key not configured. Please add your Groq API key to use the AI assistant.',
    };
  }

  try {
    let systemPrompt = SYSTEM_PROMPT;
    if (context) {
      systemPrompt += buildContextPrompt(context);
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    return {};
  } catch (error) {
    console.error('Streaming chat error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to stream response',
    };
  }
}

// Predefined quick questions for farmers
export const QUICK_QUESTIONS = [
  {
    category: 'Disease',
    questions: [
      'What disease is this and how do I treat it?',
      'Is this disease serious?',
      'How do I prevent disease spread?',
      'What chemicals should I use?',
    ],
  },
  {
    category: 'Nutrients',
    questions: [
      'What fertilizer do I need?',
      'How much fertilizer should I apply?',
      'When should I apply fertilizer?',
      'Why are my plants yellowing?',
    ],
  },
  {
    category: 'Water',
    questions: [
      'How much should I irrigate?',
      'Is my crop water-stressed?',
      'What is the best irrigation schedule?',
      'How do I improve soil moisture?',
    ],
  },
  {
    category: 'General',
    questions: [
      'What is NDVI and why does it matter?',
      'How can I save on chemical costs?',
      'When should I harvest?',
      'What are the best practices for my crop?',
    ],
  },
];

/**
 * Generate context-aware quick reply suggestions
 */
export function generateQuickReplies(analysis?: AnalysisResult, field?: Field): string[] {
  const replies: string[] = [];

  if (analysis) {
    // Disease detected
    if (analysis.disease && analysis.disease.detected && analysis.disease.confidence > 0.5) {
      replies.push('What should I do about this?');
      replies.push('How serious is this issue?');
    }

    // Nutrient analysis available
    if (analysis.nutrient && analysis.nutrient.primaryDeficiency) {
      replies.push('What fertilizer do I need?');
      replies.push('How much should I apply?');
    }

    // NDVI data available
    if (analysis.ndvi && analysis.ndvi.average) {
      replies.push('What does my NDVI score mean?');
      replies.push('How can I improve plant health?');
    }
  }

  if (field) {
    replies.push(`Tell me about ${field.cropType} farming`);
  }

  // Default questions if no specific context
  if (replies.length === 0) {
    replies.push('How can I improve my crop yield?');
    replies.push('What are common diseases in Zimbabwe?');
    replies.push('Tell me about precision agriculture');
  }

  return replies.slice(0, 3); // Limit to 3 quick replies
}
