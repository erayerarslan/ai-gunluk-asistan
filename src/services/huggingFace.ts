import { SentimentAnalysisResult, SentimentLabel } from '../types/journal';

const DISTILBERT_API_URL =
  'https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english';

const FALLBACK_SENTIMENT_API_URLS = [
  'https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
  'https://router.huggingface.co/hf-inference/models/j-hartmann/emotion-english-distilroberta-base',
];

// TODO: Hugging Face API key'inizi buraya ekleyin
// https://huggingface.co/settings/tokens adresinden token alabilirsiniz
const HUGGING_FACE_API_KEY = 'YOUR_HUGGING_FACE_API_KEY_HERE';

const baseHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(HUGGING_FACE_API_KEY && {
    Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
  }),
};

async function callHuggingFace(
  url: string,
  inputs: string,
  parameters?: Record<string, unknown>,
  retryCount = 0,
  timeoutMs = 8000,
): Promise<unknown> {
  const data: { inputs: string; parameters?: Record<string, unknown> } = {
    inputs,
  };
  if (parameters && Object.keys(parameters).length > 0) {
    data.parameters = parameters;
  }

  console.log(`[API] İstek gönderiliyor: ${url}`);
  console.log(`[API] Body: ${JSON.stringify(data)}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: baseHeaders,
      method: 'POST',
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[API] Response status: ${response.status}`);

    if (response.status === 503 && retryCount < 1) {
      await new Promise<void>(resolve => setTimeout(() => resolve(), 5000));
      return callHuggingFace(url, inputs, parameters, retryCount + 1, timeoutMs);
    }

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        // HTML error page ise sadece status code'u göster
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
          errorText = `HTML error page (${response.status})`;
        } else {
          errorText = errorText.substring(0, 200);
        }
      } catch {
        errorText = `Response okunamadı (${response.status})`;
      }
      
    }

    const result = await response.json();
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`API timeout (${timeoutMs / 1000}s)`);
    }
    throw error;
  }
}

async function callHuggingFaceWithFallback(
  urls: string[],
  inputs: string,
  parameters?: Record<string, unknown>,
  timeoutMs = 8000,
): Promise<unknown> {
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      return await callHuggingFace(url, inputs, parameters, 0, timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // 410 veya 404 gibi kalıcı hatalarda bir sonraki URL'yi dene
      if (
        lastError.message.includes('410') ||
        lastError.message.includes('404')
      ) {
        continue;
      }
      // Diğer hatalar için de devam et
      continue;
    }
  }

  throw lastError || new Error("Tüm API endpoint'leri başarısız oldu.");
}

function mapSentiment(label: string): SentimentLabel {
  const normalized = label.toLowerCase();
  if (normalized.includes('pos') || normalized.includes('positive')) {
    return 'positive';
  }
  if (normalized.includes('neg') || normalized.includes('negative')) {
    return 'negative';
  }
  return 'neutral';
}

async function fetchSentiment(text: string): Promise<SentimentLabel> {
  try {
    const result = await callHuggingFace(DISTILBERT_API_URL, text);

    let positiveScore = 0;
    let negativeScore = 0;
    let label: string | undefined;

    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      
      if (Array.isArray(firstItem)) {
        for (const item of firstItem) {
          if (item && typeof item === 'object') {
            const obj = item as { label?: string; score?: number };
            const itemLabel = obj.label?.toUpperCase() || '';
            const itemScore = obj.score || 0;
            
            if (itemLabel.includes('POSITIVE') || itemLabel.includes('POS')) {
              positiveScore = itemScore;
            } else if (itemLabel.includes('NEGATIVE') || itemLabel.includes('NEG')) {
              negativeScore = itemScore;
            }
          }
        }
      } 
      else if (firstItem && typeof firstItem === 'object') {
        const obj = firstItem as { label?: string; score?: number };
        label = obj.label;
        const score = obj.score || 0;
        
        if (label?.toUpperCase().includes('POSITIVE') || label?.toUpperCase().includes('POS')) {
          positiveScore = score;
        } else if (label?.toUpperCase().includes('NEGATIVE') || label?.toUpperCase().includes('NEG')) {
          negativeScore = score;
        }
      }
    }

    if (positiveScore > 0 || negativeScore > 0) {
      const maxScore = Math.max(positiveScore, negativeScore);
      
      if (maxScore > 0.7) {
        // Güçlü bir duygu var (> 0.7)
        const finalSentiment = positiveScore > negativeScore ? 'positive' : 'negative';
        return finalSentiment;
      } else if (maxScore > 0.4) {
        return 'neutral';
      } else {
        return 'neutral';
      }
    }
    if (label) {
      const mapped = mapSentiment(label);
      return mapped;
    }
    throw new Error('Result parse edilemedi');
  } catch {
    try {
      const result = await callHuggingFaceWithFallback(
        FALLBACK_SENTIMENT_API_URLS,
        text,
      );

      let label: string | undefined;
      let score = 0;

      if (Array.isArray(result) && result.length > 0) {
        const first = result[0] as { label?: string; score?: number };
        if (first?.label) {
          label = first.label;
          score = first.score || 0;
        }
      } else if (result && typeof result === 'object' && !Array.isArray(result)) {
        const obj = result as { label?: string; score?: number; [key: string]: unknown };
        if (obj.label) {
          label = obj.label;
          score = (obj.score as number) || 0;
        }
      }

      if (label) {
        if (label === 'joy' || label === 'love' || label === 'optimism') {
          return 'positive';
        }
        if (label === 'sadness' || label === 'anger' || label === 'fear' || label === 'disgust') {
          return 'negative';
        }
        
        const mapped = mapSentiment(label);
        if (score > 0 && score < 0.5) {
          return 'neutral';
        }
        return mapped;
      }
    } catch {
    }
  }

  const lowerText = text.toLowerCase();
  const positiveKeywords = [
    'mutlu', 'harika', 'güzel', 'iyi', 'mükemmel', 'süper', 'neşeli', 'sevinçli',
    'happy', 'great', 'good', 'excellent', 'wonderful', 'amazing', 'fantastic',
    'joyful', 'cheerful', 'glad', 'pleased', 'delighted', 'excited', 'proud',
    'başarılı', 'başarı', 'kutlama', 'celebration', 'win', 'kazan', 'motive',
    'enerjik', 'enerji', 'canlı', 'dinç'
  ];
  const negativeKeywords = [
    'kötü', 'üzgün', 'yorgun', 'stresli', 'endişeli', 'kaygılı', 'kızgın',
    'bad', 'sad', 'tired', 'stressed', 'anxious', 'worried', 'angry', 'mad',
    'frustrated', 'disappointed', 'depressed', 'exhausted', 'drained', 'upset',
    'hasta', 'sick', 'ağrı', 'pain', 'acı', 'zor', 'difficult', 'problem',
    'korku', 'fear', 'kaygı', 'anxiety', 'hayal kırıklığı', 'disappointment'
  ];
  
  const hasPositive = positiveKeywords.some(keyword => lowerText.includes(keyword));
  const hasNegative = negativeKeywords.some(keyword => lowerText.includes(keyword));
  
  if (hasPositive && hasNegative) {
    const positiveCount = positiveKeywords.filter(k => lowerText.includes(k)).length;
    const negativeCount = negativeKeywords.filter(k => lowerText.includes(k)).length;
    return positiveCount >= negativeCount ? 'positive' : 'negative';
  }

  if (hasPositive) {
    return 'positive';
  }
  if (hasNegative) {
    return 'negative';
  }

  return 'neutral';
}

async function fetchSummary(text: string): Promise<string> {
  try {
    const result = await callHuggingFace(DISTILBERT_API_URL, text);
    let positiveScore = 0;
    let negativeScore = 0;
    let label: string | undefined;

    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      
      if (Array.isArray(firstItem)) {
        for (const item of firstItem) {
          if (item && typeof item === 'object') {
            const obj = item as { label?: string; score?: number };
            const itemLabel = obj.label?.toUpperCase() || '';
            const itemScore = obj.score || 0;
            
            if (itemLabel.includes('POSITIVE') || itemLabel.includes('POS')) {
              positiveScore = itemScore;
            } else if (itemLabel.includes('NEGATIVE') || itemLabel.includes('NEG')) {
              negativeScore = itemScore;
            }
          }
        }
      } 
      else if (firstItem && typeof firstItem === 'object') {
        const obj = firstItem as { label?: string; score?: number };
        label = obj.label;
        const score = obj.score || 0;
        
        if (label?.toUpperCase().includes('POSITIVE') || label?.toUpperCase().includes('POS')) {
          positiveScore = score;
        } else if (label?.toUpperCase().includes('NEGATIVE') || label?.toUpperCase().includes('NEG')) {
          negativeScore = score;
        }
      }
    }

    // Response'u formatla ve özet olarak döndür
    if (positiveScore > 0 || negativeScore > 0) {
      const maxScore = Math.max(positiveScore, negativeScore);
      const sentimentType = positiveScore > negativeScore ? 'pozitif' : 'negatif';
      return `Duygu analizi: ${sentimentType}`;
    }

    if (label) {
      const sentimentType = label.toLowerCase().includes('positive') ? 'pozitif' : 
                           label.toLowerCase().includes('negative') ? 'negatif' : 'nötr';
      return `Duygu analizi: ${sentimentType}`;
    }
    return JSON.stringify(result);
  } catch (error) {
  }

  const preview = text.length > 60 ? text.substring(0, 60) + '...' : text;
  return preview;
}

function buildSuggestion(sentiment: SentimentLabel): string {
  switch (sentiment) {
    case 'positive':
      return 'Harika! Bu motivasyonu korumak için gün içinde kısa bir kutlama yap.';
    case 'negative':
      return 'Bugün kendine karşı nazik ol. 10 dakikalık nefes egzersizi iyi gelebilir.';
    default:
      return 'Dengeli bir gün. Bir fincan çay eşliğinde duygularını gözlemlemeyi deneyebilirsin.';
  }
}

export async function analyzeWithAI(
  text: string,
): Promise<SentimentAnalysisResult> {
  if (!text.trim()) {
    throw new Error('Metin girişi boş olamaz.');
  }

  const sentimentResult = await Promise.allSettled([
    fetchSentiment(text),
  ]);

  const finalSentiment =
    sentimentResult[0].status === 'fulfilled'
      ? sentimentResult[0].value
      : 'neutral';

  const summaryResult = await Promise.allSettled([
    fetchSummary(text),
  ]);

  const finalSummary =
    summaryResult[0].status === 'fulfilled'
      ? summaryResult[0].value
      : text.length > 60 ? text.substring(0, 60) + '...' : text;

  return {
    sentiment: finalSentiment,
    summary: finalSummary,
    suggestion: buildSuggestion(finalSentiment),
  };
}
