const Groq = require('groq-sdk');

// Key pool — up to 3 keys for rotation
const GROQ_KEYS = [
  process.env.GROQ_API_KEY_1,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter(Boolean);

if (GROQ_KEYS.length === 0) {
  console.warn('⚠️  No GROQ_API_KEY_* found in environment');
}

// Create a client per key (Groq SDK is lightweight)
const clients = GROQ_KEYS.map((key) => new Groq({ apiKey: key }));
let currentIndex = 0;

const getGroqClient = () => clients[currentIndex % clients.length];

const rotateKey = () => {
  currentIndex = (currentIndex + 1) % clients.length;
  console.log(`🔄 Rotated to Groq key #${currentIndex + 1}`);
};

const isRateLimitError = (err) => {
  const msg = String(err?.message || err?.status || '');
  return (
    err?.status === 429 ||
    msg.includes('429') ||
    msg.includes('rate_limit') ||
    msg.includes('Rate limit') ||
    msg.includes('Too Many Requests')
  );
};

/**
 * Execute a Groq API call with automatic key rotation on 429.
 * @param {(client: Groq) => Promise<any>} fn  - function that receives a Groq client
 * @returns {Promise<any>}
 */
const withGroqRotation = async (fn) => {
  const tried = new Set();
  let lastError;

  for (let attempt = 0; attempt < clients.length; attempt++) {
    const keyIdx = currentIndex % clients.length;
    if (tried.has(keyIdx)) break;
    tried.add(keyIdx);

    try {
      const result = await fn(clients[keyIdx]);
      return result;
    } catch (err) {
      lastError = err;
      if (isRateLimitError(err)) {
        console.warn(`⚠️  Groq key #${keyIdx + 1} hit rate limit — rotating...`);
        rotateKey();
        await new Promise((r) => setTimeout(r, 500)); // brief pause before retry
      } else {
        throw err; // Non-rate-limit errors throw immediately
      }
    }
  }

  throw lastError || new Error('All Groq API keys exhausted');
};

module.exports = { getGroqClient, withGroqRotation };
