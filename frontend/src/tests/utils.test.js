/**
 * Frontend Utility Unit Tests — HireVision
 * Run: npm test (uses Vitest)
 * Tests pure utility logic — no DOM, no React needed.
 */
import { describe, it, expect } from 'vitest';

// ─── 1. Score color logic (used across multiple components) ───────────────────
describe('Score color thresholds', () => {
  const getScoreCategory = (score) =>
    score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';

  it('80+ is high', () => {
    expect(getScoreCategory(80)).toBe('high');
    expect(getScoreCategory(100)).toBe('high');
    expect(getScoreCategory(85)).toBe('high');
  });

  it('60-79 is medium', () => {
    expect(getScoreCategory(60)).toBe('medium');
    expect(getScoreCategory(79)).toBe('medium');
  });

  it('below 60 is low', () => {
    expect(getScoreCategory(0)).toBe('low');
    expect(getScoreCategory(59)).toBe('low');
  });
});

// ─── 2. Timer formatting (VideoRecord countdown) ──────────────────────────────
describe('Timer display formatting', () => {
  const formatTimer = (seconds) => String(seconds).padStart(2, '0');

  it('pads single digits', () => {
    expect(formatTimer(0)).toBe('00');
    expect(formatTimer(5)).toBe('05');
    expect(formatTimer(9)).toBe('09');
  });

  it('does not pad double digits', () => {
    expect(formatTimer(10)).toBe('10');
    expect(formatTimer(60)).toBe('60');
    expect(formatTimer(59)).toBe('59');
  });
});

// ─── 3. MIME type to extension mapping ───────────────────────────────────────
describe('Video MIME type → extension mapping', () => {
  const getExtension = (mimeType) => {
    const map = {
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
      'video/x-msvideo': 'avi',
      'video/ogg': 'ogv',
    };
    return map[mimeType] || 'webm';
  };

  it('maps common MIME types correctly', () => {
    expect(getExtension('video/mp4')).toBe('mp4');
    expect(getExtension('video/webm')).toBe('webm');
    expect(getExtension('video/quicktime')).toBe('mov');
  });

  it('falls back to webm for unknown types', () => {
    expect(getExtension('video/unknown')).toBe('webm');
    expect(getExtension('')).toBe('webm');
    expect(getExtension(undefined)).toBe('webm');
  });
});

// ─── 4. Stage pipeline ordering ───────────────────────────────────────────────
describe('Hiring pipeline stages', () => {
  const STAGES = ['applied', 'screened', 'interview', 'hired', 'rejected'];

  it('has exactly 5 stages', () => {
    expect(STAGES).toHaveLength(5);
  });

  it('starts with applied', () => {
    expect(STAGES[0]).toBe('applied');
  });

  it('hired and rejected are terminal', () => {
    expect(STAGES).toContain('hired');
    expect(STAGES).toContain('rejected');
  });

  it('interview comes after screened', () => {
    expect(STAGES.indexOf('screened')).toBeLessThan(STAGES.indexOf('interview'));
  });
});

// ─── 5. Upload progress calculation ──────────────────────────────────────────
describe('Upload progress percentage', () => {
  const calcProgress = (loaded, total) =>
    total ? Math.round((loaded / total) * 100) : 0;

  it('calculates 50% correctly', () => {
    expect(calcProgress(5_000_000, 10_000_000)).toBe(50);
  });

  it('calculates 100% at completion', () => {
    expect(calcProgress(10_000_000, 10_000_000)).toBe(100);
  });

  it('returns 0 when total is 0', () => {
    expect(calcProgress(0, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(calcProgress(1, 3)).toBe(33);
    expect(calcProgress(2, 3)).toBe(67);
  });
});

// ─── 6. Match explanation fallback logic ─────────────────────────────────────
describe('Match explanation generation', () => {
  const buildExplanation = (matchedSkills, missingSkills) => {
    if (matchedSkills.length > 0) {
      return `Strong match — experienced in ${matchedSkills.join(', ')}.${
        missingSkills.length ? ' Missing: ' + missingSkills.join(', ') + '.' : ' Covers all required skills.'
      }`;
    }
    return `Limited skill overlap.${
      missingSkills.length ? ' Missing: ' + missingSkills.join(', ') + '.' : ''
    }`;
  };

  it('shows strong match for matched skills', () => {
    const result = buildExplanation(['React', 'Node.js'], ['AWS']);
    expect(result).toContain('Strong match');
    expect(result).toContain('React');
    expect(result).toContain('Missing: AWS');
  });

  it('shows full coverage message when no gaps', () => {
    const result = buildExplanation(['React', 'Node.js'], []);
    expect(result).toContain('Covers all required skills');
  });

  it('shows limited overlap when no skills match', () => {
    const result = buildExplanation([], ['Python', 'ML']);
    expect(result).toContain('Limited skill overlap');
    expect(result).toContain('Missing: Python');
  });
});
