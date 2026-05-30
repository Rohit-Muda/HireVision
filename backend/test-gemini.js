/**
 * Full end-to-end test of the AI pipeline using the exact same code as production.
 * Run from: backend/
 *   node test-gemini.js
 */
require('dotenv').config();

// Patch process.env so getGenAI() works
process.env.NODE_ENV = 'test';

const { analyzeTranscript } = require('./src/services/aiService');

const TEST_TRANSCRIPT = `Hi, my name is Priya and I'm a backend developer with 4 years of experience in Node.js 
and Express. I've worked extensively with MongoDB and PostgreSQL for database design. 
I recently built a microservices architecture for a fintech startup that handled 50,000 daily transactions.
I'm proficient in Docker, Kubernetes, and AWS services including EC2, RDS, and Lambda.
I'm passionate about clean code, system design, and I've mentored a team of 3 junior developers.
I'm looking for a senior backend role at a product company.`;

async function runTest() {
  console.log('\n🚀 HireVision — Full AI Pipeline Test');
  console.log('='.repeat(50));
  console.log(`📝 Transcript: ${TEST_TRANSCRIPT.length} characters`);
  console.log('='.repeat(50) + '\n');

  const start = Date.now();

  try {
    const result = await analyzeTranscript(TEST_TRANSCRIPT);
    const elapsed = Date.now() - start;

    console.log(`✅ Analysis complete in ${elapsed}ms (model: ${result.modelUsed})\n`);
    console.log('📊 Results:');
    console.log(`   Skills detected (${result.skills.length}): ${result.skills.join(', ')}`);
    console.log(`   Experience: ${result.experienceSummary}`);
    console.log(`   Communication score: ${result.communicationScore}/10`);
    console.log(`   Confidence: ${result.confidenceIndicators}`);
    console.log(`   AI Summary: ${result.aiSummary}`);
    console.log(`   Mode: ${result.analysisMode}`);
    console.log('\n🎉 Pipeline fully operational! The analyze-video endpoint will work.\n');
    process.exit(0);
  } catch (err) {
    console.error(`❌ Analysis failed (${Date.now() - start}ms):`);
    console.error(`   ${err.message}`);
    console.error('\n💡 Check: GEMINI_API_KEY in backend/.env is valid and has quota.\n');
    process.exit(1);
  }
}

runTest();
