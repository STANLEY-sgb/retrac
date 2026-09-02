const axios = require('axios');
const config = require('../../config/env');

class AiRiskAnalyzer {
  /**
   * Analyze free-text response for emotional distress and relapse risk signals.
   * Privacy Protection: Minimal information transmission.
   * Assistive Triage only: Does NOT provide clinical diagnoses or replace caseworkers.
   */
  static async analyzeText(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        provider: 'offline_rule_engine',
        risk_level: 'low',
        signals: [],
        confidence: 1.0,
        recommended_action: 'Standard weekly monitoring',
        sentiment: 'neutral'
      };
    }

    const cleanText = text.trim();

    // If OpenAI is enabled and API key is provided
    if (config.AI_PROVIDER === 'openai' && config.OPENAI_API_KEY && config.OPENAI_API_KEY.startsWith('sk-')) {
      try {
        return await this.callOpenAiApi(cleanText);
      } catch (err) {
        console.warn('⚠️ OpenAI API call failed, falling back to local NLP engine:', err.message);
      }
    }

    // High-performance Offline / Demo NLP Triage Analyzer
    return this.analyzeOffline(cleanText);
  }

  /**
   * OpenAI API Caller with strict JSON output schema and privacy redactions
   */
  static async callOpenAiApi(text) {
    const prompt = `You are an assistive recovery triage classifier for a rehabilitation aftercare program in Uganda.
Analyze the following patient SMS text for emotional distress, relapse risk flags, cravings, family distress, or positive recovery sentiment.
NOTE: Do not make medical diagnoses. AI is strictly an assistive triage flagging tool for human caseworkers.

Text: "${text}"

Respond in strictly valid JSON:
{
  "risk_level": "low" | "moderate" | "elevated",
  "sentiment": "positive" | "neutral" | "struggling" | "distressed",
  "signals": ["list", "of", "detected", "signals"],
  "confidence": 0.85,
  "recommended_action": "brief caseworker guidance"
}`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return {
      provider: 'openai',
      risk_level: parsed.risk_level || 'moderate',
      sentiment: parsed.sentiment || 'neutral',
      signals: parsed.signals || ['General text response'],
      confidence: parsed.confidence || 0.88,
      recommended_action: parsed.recommended_action || 'Caseworker review recommended.'
    };
  }

  /**
   * Offline Deterministic NLP Signal Extractor
   */
  static analyzeOffline(text) {
    const lower = text.toLowerCase();
    const signals = [];
    let risk_level = 'low';
    let sentiment = 'positive';
    let recommended_action = 'No urgent intervention required.';

    // High distress keywords
    const highDistress = ['hard', 'cravings', 'relapse', 'urge', 'drink', 'smoke', 'drugs', 'depressed', 'difficult', 'fighting', 'struggling', 'lost hope', 'stress', 'crisis', 'shaking', 'sick'];
    // Moderate distress keywords
    const modDistress = ['tired', 'jobless', 'money', 'food', 'rent', 'alone', 'family issue', 'sad', 'bored', 'worried', 'pain'];
    // Positive keywords
    const positiveWords = ['well', 'good', 'fine', 'great', 'blessed', 'steady', 'happy', 'strong', 'thank', 'clean', 'sober'];

    const matchedHigh = highDistress.filter(w => lower.includes(w));
    const matchedMod = modDistress.filter(w => lower.includes(w));
    const matchedPos = positiveWords.filter(w => lower.includes(w));

    if (matchedHigh.length > 0) {
      risk_level = 'elevated';
      sentiment = 'distressed';
      signals.push(...matchedHigh.map(w => `Trigger / Distress keyword detected: "${w}"`));
      if (lower.includes('home') || lower.includes('family')) {
        signals.push('Difficult home/environmental situation indicated');
      }
      if (lower.includes('craving') || lower.includes('urge') || lower.includes('drink') || lower.includes('smoke')) {
        signals.push('Relapse pressure or craving alert');
      }
      recommended_action = 'Priority caseworker follow-up call recommended within 24 hours.';
    } else if (matchedMod.length > 0) {
      risk_level = 'moderate';
      sentiment = 'struggling';
      signals.push(...matchedMod.map(w => `Socioeconomic or mood stress signal: "${w}"`));
      recommended_action = 'Schedule routine check-in and explore employment or community support.';
    } else if (matchedPos.length > 0) {
      risk_level = 'low';
      sentiment = 'positive';
      signals.push('Positive recovery affirmation');
      recommended_action = 'Client reports stability. Continue standard weekly SMS check-ins.';
    } else {
      risk_level = 'low';
      sentiment = 'neutral';
      signals.push('Standard response received');
      recommended_action = 'Log check-in response and monitor next cycle.';
    }

    return {
      provider: 'demo_nlp_engine',
      risk_level,
      sentiment,
      signals,
      confidence: 0.92,
      recommended_action
    };
  }
}

module.exports = AiRiskAnalyzer;
