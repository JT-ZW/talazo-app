# AI Assistant Setup Guide

## Overview
The Talazo AI Assistant is a context-aware agricultural chatbot powered by Groq's ultra-fast LLM API (Llama 3.1 70B). It provides farmers with instant access to expert agricultural advice, personalized recommendations based on their analysis results, and answers to farming questions in natural language.

## Features

### 🎯 Context-Aware Responses
The assistant automatically understands:
- Current analysis results (disease detection, nutrient deficiencies, NDVI scores)
- Field information (crop type, planting date, area)
- Weather conditions (temperature, humidity, forecasts)
- Zone analysis data (problem areas, resource optimization)

### ⚡ Ultra-Fast Streaming
- Powered by Groq API: **500+ tokens/second** (10x faster than standard APIs)
- Real-time streaming responses for better user experience
- No perceived latency during conversations

### 🌾 Agricultural Expertise
Specialized knowledge in:
- 8 priority crops: Tobacco, Maize, Tomato, Potato, Wheat, Watermelon, Blueberry, Cotton
- Disease management and treatment
- Nutrient deficiency diagnosis and fertilizer recommendations
- Precision agriculture techniques
- Resource optimization strategies
- Zimbabwe-specific farming practices

### 💬 Natural Language Interface
- Conversational interaction with complex analysis data
- Quick reply suggestions based on current context
- Clear, actionable advice without technical jargon
- Multilingual capability (English, with Shona/Ndebele planned)

## Setup Instructions

### 1. Get Your Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

### 2. Configure Environment Variables

Add to your `.env.local` file:

```env
# Groq AI Assistant Configuration
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_GROQ_MODEL=llama-3.1-70b-versatile
```

**Free Tier Limits:**
- 14,400 requests per day
- 500+ tokens/second processing speed
- No credit card required
- Perfect for competition demos and MVP testing

### 3. Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Log into the dashboard
3. Look for the green floating chat button in the bottom-right corner
4. Click to open the AI Assistant
5. Try asking: "How can I improve my crop yield?"

## Architecture

### Service Layer (`src/lib/aiAssistant.ts`)

#### Core Functions

**`sendChatMessage(message, conversationHistory, context?)`**
- Synchronous chat function
- Returns complete response after processing
- Use for simple implementations

**`sendChatMessageStreaming(message, conversationHistory, onChunk, context?)`**
- Streaming chat function (recommended)
- Calls `onChunk` callback with each token
- Better user experience with real-time updates

**`generateQuickReplies(analysis?, field?)`**
- Generates context-aware question suggestions
- Returns up to 3 relevant quick replies
- Changes based on available data (disease detection, nutrient analysis, NDVI)

**`buildContextPrompt(context)`**
- Internal function that constructs context-aware system prompts
- Injects analysis results, field data, and weather information
- Creates specialized prompts for each conversation

#### Data Types

```typescript
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatContext {
  analysis?: AnalysisResult;      // Current disease/nutrient/water analysis
  field?: Field;                   // Field information (crop, area, etc.)
  weatherData?: {                  // Weather conditions
    temp: number;
    description: string;
    humidity: number;
  };
  zoneSummary?: {                  // Zone analysis data
    totalZones: number;
    criticalZones: number;
    savings: number;
  };
}
```

### UI Component (`src/components/ChatInterface.tsx`)

#### Props

```typescript
interface ChatInterfaceProps {
  context?: ChatContext;           // Pass analysis/field data for context
  initiallyMinimized?: boolean;    // Start minimized (default: true)
  position?: 'floating' | 'sidebar'; // Display mode
}
```

#### Features

- **Floating Mode**: Bottom-right chat bubble, can minimize/maximize/close
- **Sidebar Mode**: Full-height panel for insights page
- **Message History**: Maintains conversation context
- **Quick Replies**: Context-aware button suggestions
- **Streaming Display**: Real-time token rendering
- **Responsive Design**: Mobile-friendly interface

## Usage Examples

### Basic Integration (Floating Chat)

Already integrated in `src/app/dashboard/layout.tsx`:

```tsx
import ChatInterface from '@/components/ChatInterface';

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      <ChatInterface position="floating" initiallyMinimized={true} />
    </div>
  );
}
```

### Context-Aware Integration (Insights Page)

Example for analysis result page:

```tsx
'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { type ChatContext } from '@/lib/aiAssistant';

export default function AnalysisPage({ params }) {
  const [analysis, setAnalysis] = useState(null);
  const [field, setField] = useState(null);
  
  // Load analysis and field data...
  
  const chatContext: ChatContext = {
    analysis,
    field,
    weatherData: {
      temp: 28,
      description: 'Partly cloudy',
      humidity: 65
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        {/* Analysis results display */}
      </div>
      <div className="w-96">
        <ChatInterface 
          context={chatContext} 
          position="sidebar"
          initiallyMinimized={false}
        />
      </div>
    </div>
  );
}
```

### Programmatic Interaction

For custom implementations:

```typescript
import { sendChatMessage } from '@/lib/aiAssistant';

async function askQuestion() {
  const response = await sendChatMessage(
    "What's the best fertilizer for tobacco?",
    [],  // Empty conversation history
    {
      field: {
        id: '1',
        cropType: 'Tobacco',
        area: 5.0,
        // ... other field data
      }
    }
  );
  
  console.log(response.response);
}
```

## Conversation Examples

### Disease Detection Scenario

**Context:** Tobacco blight detected at 87% confidence, HIGH severity

**User:** "Is this serious?"

**Assistant:** "Yes, this is very serious. Your tobacco field has bacterial blight at HIGH severity with 87% confidence, affecting a significant portion of the leaf area. This disease can spread rapidly and cause major yield losses if not treated immediately. I recommend:

1. Apply copper-based fungicide (2-3 kg/ha) within 24-48 hours
2. Remove and destroy severely infected plants
3. Improve air circulation by increasing plant spacing
4. Avoid overhead irrigation which spreads the bacteria
5. Monitor daily for new infections

Would you like specific product recommendations available in Zimbabwe?"

### Nutrient Deficiency Scenario

**Context:** Maize field showing nitrogen deficiency, NDVI score 0.45

**User:** "How much fertilizer?"

**Assistant:** "Based on your analysis showing nitrogen deficiency with an NDVI score of 0.45 (moderate stress), I recommend:

**Immediate Application:**
- Urea (46-0-0): 150-200 kg/ha
- Or Ammonium Nitrate (34-0-0): 200-250 kg/ha

**Application Method:**
- Side-dress alongside plant rows
- Apply when soil is moist (after irrigation or rain)
- Split into 2 applications 2 weeks apart for better efficiency

**Cost Estimate:** $75-100 per hectare

Your field is 3.5 hectares, so you'll need approximately 525-700 kg of urea. This should bring your NDVI back to healthy range (0.6-0.9) within 2-3 weeks.

Would you like guidance on application timing or sourcing fertilizer?"

### Precision Agriculture Scenario

**Context:** Zone analysis showing 4 critical zones out of 16 total, potential savings 62%

**User:** "Which zones need treatment?"

**Assistant:** "Great question! Your precision agriculture analysis identified 4 critical zones out of 16 total (25% of your field). Here's the breakdown:

**Critical Zones (Immediate Treatment):**
- Zone 2 (Northwest): High disease pressure, apply fungicide
- Zone 6 (North-Central): Severe nutrient deficiency, apply fertilizer
- Zone 10 (South-Central): Water stress + disease, irrigate + treat
- Zone 14 (Southeast): Disease + nutrient issues, combined treatment

**Healthy Zones (No Treatment):**
- Zones 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15, 16 (75% of field)

**Resource Optimization:**
- Full-field treatment would cost: $250
- Precision treatment (critical zones only): $95
- **Your savings: $155 (62%)**

This targeted approach reduces chemical usage by 62% while maintaining crop health. Would you like detailed recommendations for each critical zone?"

### General Agricultural Advice

**User:** "What are the best practices for seed potato production?"

**Assistant:** "Excellent question! Seed potato production is highly profitable in Zimbabwe. Here are the key best practices:

**1. Variety Selection:**
- BP1 (excellent for Zimbabwean conditions)
- Mondial (high yield, disease resistant)
- Diamant (drought tolerant)

**2. Seed Preparation:**
- Use certified disease-free seed (critical!)
- Pre-sprout for 2-3 weeks before planting
- Cut large tubers ensuring 2-3 eyes per piece

**3. Planting (April-May for winter crop):**
- Row spacing: 90cm
- Plant spacing: 30cm
- Planting depth: 10-15cm
- Plant in moist soil

**4. Disease Management:**
- Apply copper fungicide preventatively
- Scout weekly for late blight
- Remove diseased plants immediately

**5. Certification:**
- Register with Department of Research & Specialist Services
- Follow seed certification protocols
- Keep detailed records for traceability

**Market Potential:**
- Certified seed potatoes sell 3-5x higher than table potatoes
- SADC export opportunities
- Contracts available with larger producers

Would you like specific guidance on any of these areas?"

## Quick Reply Examples

The assistant generates context-aware quick replies based on available data:

### With Disease Detection
- "What should I do about this?"
- "How serious is this issue?"
- "Tell me about tobacco farming"

### With Nutrient Analysis
- "What fertilizer do I need?"
- "How much should I apply?"
- "Tell me about maize farming"

### With NDVI Data
- "What does my NDVI score mean?"
- "How can I improve plant health?"
- "Tell me about wheat farming"

### Default (No Context)
- "How can I improve my crop yield?"
- "What are common diseases in Zimbabwe?"
- "Tell me about precision agriculture"

## Performance Optimization

### Caching Strategy

Implement Redis/memory caching for common questions:

```typescript
const questionCache = new Map();

async function getCachedResponse(question: string) {
  if (questionCache.has(question)) {
    return questionCache.get(question);
  }
  
  const response = await sendChatMessage(question, []);
  questionCache.set(question, response);
  return response;
}
```

### Rate Limiting

Free tier allows 14,400 requests/day = 600/hour. Implement per-user limits:

```typescript
const userRequests = new Map();

function checkRateLimit(userId: string): boolean {
  const userCount = userRequests.get(userId) || 0;
  if (userCount >= 50) { // 50 messages per hour per user
    return false;
  }
  userRequests.set(userId, userCount + 1);
  return true;
}
```

### Error Handling

```typescript
try {
  const response = await sendChatMessageStreaming(/* ... */);
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    showMessage("Please wait a moment before sending another message");
  } else if (error.status === 401) {
    // Invalid API key
    showMessage("AI Assistant is temporarily unavailable");
  } else {
    // Generic error
    showMessage("Sorry, I encountered an error. Please try again.");
  }
}
```

## Multilingual Support (Planned)

The Llama 3.1 model has some capability in Shona and Ndebele. To enable:

### Language Detection

```typescript
export function detectLanguage(message: string): 'en' | 'sn' | 'nd' {
  const shonaIndicators = ['ndinotsvaga', 'ndiri', 'chirimwa', 'murimi'];
  const ndebeleIndicators = ['ngifuna', 'ngi', 'isitshalo', 'umlimi'];

  const lowerMessage = message.toLowerCase();

  if (shonaIndicators.some(word => lowerMessage.includes(word))) {
    return 'sn';
  }
  if (ndebeleIndicators.some(word => lowerMessage.includes(word))) {
    return 'nd';
  }
  return 'en';
}
```

### Language-Specific Prompts

Modify system prompt based on detected language:

```typescript
const SHONA_PROMPT = "Uri nyanzvi yekurima muZimbabwe. Una ruzivo rwakadzama...";
const NDEBELE_PROMPT = "Ungumxhasi wezolimo eZimbabwe. Ulolwazi olunzulu...";
```

## Competition Demo Tips

### Showcase Scenarios

1. **Disease Detection + Chat**
   - Upload tobacco leaf with blight
   - Show analysis results
   - Open chat and ask "Is this serious?"
   - Demonstrate context-aware response referencing specific analysis data

2. **Resource Optimization**
   - Show zone analysis with 60% savings
   - Ask chat "How much will I save?"
   - Show detailed breakdown and ROI calculation

3. **Expert Advice**
   - Ask general farming question
   - Demonstrate agricultural expertise
   - Show quick reply suggestions

4. **Natural Language Accessibility**
   - Emphasize how farmers can ask questions naturally
   - No technical knowledge required
   - 24/7 availability vs. extension officers

### Talking Points

- **AI Sophistication:** "We use two AI systems - computer vision for analysis AND natural language for farmer support"
- **Performance:** "500+ tokens per second = instant responses, no waiting"
- **Context-Awareness:** "The AI understands YOUR specific analysis results, not just generic advice"
- **Accessibility:** "Natural language interface makes advanced technology accessible to all farmers"
- **Scalability:** "One AI assistant can support unlimited farmers 24/7"
- **Cost Efficiency:** "Free tier supports 14,400 conversations per day"

## Troubleshooting

### Issue: "Groq API key not configured"
**Solution:** Check `.env.local` file has valid `GROQ_API_KEY`

### Issue: Slow responses
**Solution:** Check internet connection; Groq should be 500+ tokens/sec

### Issue: Rate limit exceeded
**Solution:** Implement per-user rate limiting (50 messages/hour recommended)

### Issue: Context not reflecting in responses
**Solution:** Ensure `ChatContext` is properly passed to `ChatInterface` component

### Issue: Streaming not working
**Solution:** Check that `onChunk` callback is provided to `sendChatMessageStreaming`

## API Reference

### Groq API Endpoint

```
POST https://api.groq.com/openai/v1/chat/completions
```

### Request Format

```json
{
  "model": "llama-3.1-70b-versatile",
  "messages": [
    { "role": "system", "content": "You are an expert..." },
    { "role": "user", "content": "What fertilizer do I need?" }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1024
}
```

### Response Format (Streaming)

```
data: {"choices":[{"delta":{"content":"Based "}}]}
data: {"choices":[{"delta":{"content":"on "}}]}
data: {"choices":[{"delta":{"content":"your "}}]}
...
data: [DONE]
```

## Future Enhancements

1. **Voice Input:** Integrate speech-to-text for hands-free operation
2. **Image Understanding:** Send analysis images directly to multimodal AI
3. **Multilingual:** Full Shona/Ndebele translation layer
4. **Historical Context:** Remember previous conversations
5. **Predictive Advice:** Proactive recommendations based on weather forecasts
6. **Community Knowledge:** Learn from aggregated farmer experiences
7. **Offline Mode:** Cached responses for common questions

## Resources

- [Groq Console](https://console.groq.com)
- [Groq Documentation](https://console.groq.com/docs)
- [Llama 3.1 Model Card](https://ai.meta.com/llama/)
- [OpenAI API Compatibility](https://platform.openai.com/docs/api-reference)

## Support

For issues or questions about the AI Assistant integration:
1. Check this documentation
2. Review conversation examples
3. Test with simple questions first
4. Check API key configuration
5. Monitor rate limits

---

**Built with:** Groq API | Llama 3.1 70B | Next.js | TypeScript | Tailwind CSS

**Performance:** 500+ tokens/second | 14,400 requests/day | Zero cost

**Focus:** Zimbabwe agricultural expertise | Context-aware responses | Natural language accessibility
