const { GoogleGenerativeAI } = require('@google/generative-ai');

// Key pool — up to 3 keys for rotation
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

if (GEMINI_KEYS.length === 0) {
  // Fallback to legacy single key
  if (process.env.GEMINI_API_KEY) {
    GEMINI_KEYS.push(process.env.GEMINI_API_KEY);
  } else {
    console.warn('⚠️  No GEMINI_API_KEY_* found in environment');
  }
}

// One client per key
const clients = GEMINI_KEYS.map((key) => new GoogleGenerativeAI(key));
let currentIndex = 0;

const getGenAI = () => clients[currentIndex % clients.length];

const rotateKey = () => {
  currentIndex = (currentIndex + 1) % clients.length;
  console.log(`🔄 Rotated to Gemini key #${currentIndex + 1}`);
};

const isRateLimitError = (err) => {
  const msg = String(err?.message || '');
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('Too Many Requests') ||
    msg.includes('RESOURCE_EXHAUSTED')
  );
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const parseRetryDelay = (errorMessage) => {
  const match = errorMessage?.match(/retry\s*in\s*(\d+(?:\.\d+)?)\s*s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 1000 : 8000;
};

/**
 * Execute a Gemini API call with automatic key rotation on quota errors.
 * @param {(genAI: GoogleGenerativeAI) => Promise<any>} fn
 * @returns {Promise<any>}
 */
const withGeminiRotation = async (fn) => {
  const tried = new Set();
  let lastError;

  for (let attempt = 0; attempt < clients.length; attempt++) {
    const keyIdx = currentIndex % clients.length;
    if (tried.has(keyIdx)) break;
    tried.add(keyIdx);

    try {
      return await fn(clients[keyIdx], GEMINI_KEYS[keyIdx]);
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        const delay = parseRetryDelay(err.message);
        console.warn(`⚠️  Gemini key #${keyIdx + 1} quota hit — rotating (delay: ${(delay / 1000).toFixed(0)}s)...`);
        rotateKey();
        await sleep(Math.min(delay, 5000)); // cap at 5s per rotation attempt
      } else {
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini API keys exhausted');
};

module.exports = { getGenAI, withGeminiRotation };
