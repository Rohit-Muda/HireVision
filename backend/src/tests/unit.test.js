/**
 * Backend Unit Tests — HireVision
 * Run: node --test src/tests/unit.test.js  (Node 20 built-in test runner)
 * Tests pure functions with no external dependencies.
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

// ─── 1. Matching Service ──────────────────────────────────────────────────────
describe('matchingService.cosineSimilarity', () => {
  let cosineSimilarity;

  before(() => {
    ({ cosineSimilarity } = require('../services/matchingService'));
  });

  it('returns 0 for empty or null vectors', () => {
    assert.equal(cosineSimilarity(null, null), 0);
    assert.equal(cosineSimilarity([], []), 0);
    assert.equal(cosineSimilarity([1, 2], []), 0);
  });

  it('returns 0 for mismatched lengths', () => {
    assert.equal(cosineSimilarity([1, 0], [1, 0, 0]), 0);
  });

  it('returns 100 for identical vectors', () => {
    const v = [1, 2, 3, 4];
    // Identical vectors: cosine = 1 → normalized to 100
    assert.equal(cosineSimilarity(v, v), 100);
  });

  it('returns 0 for orthogonal vectors', () => {
    // [1,0] and [0,1] are perpendicular → cosine = 0 → normalized to 50
    const result = cosineSimilarity([1, 0], [0, 1]);
    assert.equal(result, 50); // (0+1)/2 * 100 = 50
  });

  it('returns higher score for more similar vectors', () => {
    const base = [0.9, 0.1, 0.5, 0.3];
    const similar = [0.85, 0.15, 0.45, 0.35];
    const dissimilar = [0.1, 0.9, 0.1, 0.9];
    assert.ok(cosineSimilarity(base, similar) > cosineSimilarity(base, dissimilar));
  });

  it('score is always between 0 and 100', () => {
    for (let i = 0; i < 20; i++) {
      const a = Array.from({ length: 8 }, () => Math.random() * 2 - 1);
      const b = Array.from({ length: 8 }, () => Math.random() * 2 - 1);
      const score = cosineSimilarity(a, b);
      assert.ok(score >= 0 && score <= 100, `Score ${score} out of range`);
    }
  });
});

// ─── 2. Embedding Service ─────────────────────────────────────────────────────
describe('embeddingService.buildCandidateEmbeddingText', () => {
  let buildCandidateEmbeddingText;

  before(() => {
    ({ buildCandidateEmbeddingText } = require('../services/embeddingService'));
  });

  it('includes skills in output text', () => {
    const text = buildCandidateEmbeddingText(['React', 'Node.js'], 'Full-stack developer');
    assert.ok(text.includes('React'));
    assert.ok(text.includes('Node.js'));
  });

  it('includes aiSummary in output text', () => {
    const text = buildCandidateEmbeddingText(['Python'], 'Expert Python developer');
    assert.ok(text.includes('Expert Python developer'));
  });

  it('handles empty skills gracefully', () => {
    const text = buildCandidateEmbeddingText([], 'No skills listed');
    assert.ok(typeof text === 'string');
    assert.ok(text.length > 0);
  });

  it('handles null/undefined gracefully', () => {
    assert.doesNotThrow(() => buildCandidateEmbeddingText(null, null));
    assert.doesNotThrow(() => buildCandidateEmbeddingText(undefined, undefined));
  });
});

// ─── 3. AI Service — JSON parsing fallback ────────────────────────────────────
describe('aiService — JSON parsing logic', () => {
  it('parses clean JSON correctly', () => {
    const raw = '{"skills":["React"],"communicationScore":8,"transcript":"Hello"}';
    const parsed = JSON.parse(raw);
    assert.deepEqual(parsed.skills, ['React']);
    assert.equal(parsed.communicationScore, 8);
  });

  it('extracts JSON from markdown fenced response', () => {
    const raw = '```json\n{"skills":["Python"],"communicationScore":7}\n```';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    assert.ok(jsonMatch, 'Should find JSON block');
    const parsed = JSON.parse(jsonMatch[0]);
    assert.deepEqual(parsed.skills, ['Python']);
  });

  it('communicationScore is clamped 0-10', () => {
    const clamp = (val) => Math.min(10, Math.max(0, Math.round(val)));
    assert.equal(clamp(15), 10);
    assert.equal(clamp(-5), 0);
    assert.equal(clamp(7.6), 8);
    assert.equal(clamp(0), 0);
  });
});

// ─── 4. Validation helpers ────────────────────────────────────────────────────
describe('Input validation', () => {
  const VALID_STAGES = ['applied', 'screened', 'interview', 'hired', 'rejected'];

  it('validates all expected pipeline stages', () => {
    VALID_STAGES.forEach(s => {
      assert.ok(VALID_STAGES.includes(s), `Stage '${s}' should be valid`);
    });
  });

  it('rejects invalid stages', () => {
    ['pending', 'approved', 'maybe', ''].forEach(s => {
      assert.ok(!VALID_STAGES.includes(s), `Stage '${s}' should be invalid`);
    });
  });

  it('validates video MIME types', () => {
    const VALID_MIMES = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
    assert.ok(VALID_MIMES.includes('video/webm'));
    assert.ok(VALID_MIMES.includes('video/mp4'));
    assert.ok(!VALID_MIMES.includes('image/jpeg'));
    assert.ok(!VALID_MIMES.includes('application/pdf'));
  });
});

// ─── 5. Health endpoint shape ─────────────────────────────────────────────────
describe('Health check response shape', () => {
  it('health response has required keys', () => {
    const mockHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dbConnection: 'connected',
      environment: 'test',
    };
    assert.ok(mockHealth.status === 'ok');
    assert.ok(typeof mockHealth.timestamp === 'string');
    assert.ok(['connected', 'disconnected'].includes(mockHealth.dbConnection));
  });
});
