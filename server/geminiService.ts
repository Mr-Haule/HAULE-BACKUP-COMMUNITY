import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

/**
 * FEATURE 1: Convert text to speech using model gemini-3.8-flash-tts
 */
export async function generateSpeechTTS(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
  const ai = getAiClient();
  const cleanText = text.slice(0, 1500); // Guard text length

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, authoritative and passionate sports broadcaster'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS.');
    }

    return {
      audioBase64: base64Audio,
      mimeType: 'audio/wav'
    };
  } catch (err: any) {
    console.error('Error in gemini-3.8-flash-tts:', err);
    throw err;
  }
}

/**
 * FEATURE 2: Multi-turn Chat interface using Gemini
 */
export async function chatWithGemini(
  message: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
  preferredModel: string = 'gemini-3.8-flash'
): Promise<string> {
  const ai = getAiClient();

  const systemInstruction = `You are the Chief Football Scout & Statistical Analyst for the "HAULE BACKUP COMMUNITY".
Your expertise is evaluating real football fixtures, expected goals (xG), recent form, H2H records, tactical setups, and betting market value.
Guidelines:
- Maintain an authoritative, sharp, analytical, sports-scout tone.
- Give data-driven explanations (mention Poisson probability distributions, offensive ratings, defensive vulnerabilities).
- Remind users that predictions require a strict 75% confidence threshold and disciplined bankroll management.
- Keep answers formatted with crisp bullet points, bold key stats, and clear conclusions.`;

  try {
    // Model selection based on user requirements:
    // gemini-4-carbon for deep reasoning, gemini-4-argon for complex interactive, gemini-3.8-flash for general, gemini-3.1-flash-lite for fast
    let selectedModel = preferredModel;
    if (!['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon', 'gemini-4-carbon'].includes(selectedModel)) {
      selectedModel = 'gemini-3.8-flash';
    }

    const chat = ai.chats.create({
      model: selectedModel,
      config: {
        systemInstruction
      },
      history: history.slice(-10) // Keep last 10 turns
    });

    const response = await chat.sendMessage({ message });
    return response.text || 'Analysis completed with no additional remarks.';
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    // Fallback to flash if carbon/argon failed due to quota/credentials
    if (preferredModel !== 'gemini-3.8-flash') {
      try {
        const fallbackChat = ai.chats.create({
          model: 'gemini-3.8-flash',
          config: { systemInstruction },
          history: history.slice(-6)
        });
        const fallbackResp = await fallbackChat.sendMessage({ message });
        return fallbackResp.text || 'Analysis generated via scout fallback channel.';
      } catch (fallbackErr) {
        console.error('Fallback chat failed:', fallbackErr);
      }
    }
    throw err;
  }
}

/**
 * FEATURE 3: Analyze uploaded images (betting slip, lineup sheet, tactical board) using model gemini-4-argon
 */
export async function analyzeFootballImage(
  base64Data: string,
  mimeType: string,
  userPrompt?: string
): Promise<string> {
  const ai = getAiClient();

  const prompt = userPrompt && userPrompt.trim()
    ? userPrompt
    : `You are an elite football scout and betting analyst for HAULE BACKUP COMMUNITY.
Analyze this uploaded football image (betting slip, tactical pitch, team lineup, or match statistics sheet):
1. Identify all detected teams, matches, dates, odds, and selections visible.
2. Calculate the statistical risk profile and expected value.
3. Compare against verified football form, goal expectancy, and defensive metrics.
4. Give a clear verdict: APPROVED (Strong Value), HIGH RISK (Caution), or AVOID.
5. Provide actionable recommendations to improve the winning probability to >= 75% confidence.`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType || 'image/jpeg',
      data: base64Data
    }
  };

  const textPart = {
    text: prompt
  };

  // User specifically requested gemini-4-argon
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: { parts: [imagePart, textPart] }
    });
    return response.text || 'Slip analysis finished with no text output.';
  } catch (err: any) {
    console.warn('gemini-4-argon call failed (may require paid billing or hit quota), falling back to gemini-3.8-flash:', err.message);
    try {
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [imagePart, textPart] }
      });
      return fallbackResp.text || 'Slip analyzed successfully.';
    } catch (fallbackErr: any) {
      console.error('Image analysis fallback failed:', fallbackErr);
      throw new Error(`Slip analysis failed: ${fallbackErr.message || 'Image processing error'}`);
    }
  }
}
