import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle, XCircle, Loader2, ChevronRight, RotateCcw, BookOpen, Trophy } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function SkillAssessment({ skills = [], onBadgeEarned }) {
  const [phase, setPhase] = useState('select'); // select | loading | quiz | submitting | results
  const [selectedSkill, setSelectedSkill] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [results, setResults] = useState(null);

  const activeSkill = selectedSkill || customSkill;

  const startQuiz = async () => {
    if (!activeSkill.trim()) return toast.error('Please select or type a skill');
    setPhase('loading');
    try {
      const { data } = await api.post('/assessments/generate', { skill: activeSkill });
      setQuestions(data.questions);
      setSelectedAnswers(new Array(data.questions.length).fill(''));
      setCurrentQ(0);
      setPhase('quiz');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz.');
      setPhase('select');
    }
  };

  const selectAnswer = (option) => {
    const updated = [...selectedAnswers];
    updated[currentQ] = option;
    setSelectedAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) setCurrentQ(q => q + 1);
  };

  const submitQuiz = async () => {
    setPhase('submitting');
    try {
      const { data } = await api.post('/assessments/submit', {
        skill: activeSkill,
        answers: selectedAnswers,
      });
      setResults(data);
      if (data.passed && onBadgeEarned) onBadgeEarned(data.badge);
      setPhase('results');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed.');
      setPhase('quiz');
    }
  };

  const reset = () => {
    setPhase('select');
    setSelectedSkill('');
    setCustomSkill('');
    setQuestions([]);
    setSelectedAnswers([]);
    setCurrentQ(0);
    setResults(null);
  };

  const optionLetter = (opt) => opt.charAt(0).toUpperCase();

  if (phase === 'loading' || phase === 'submitting') return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
      <p className="text-gray-500 font-medium">{phase === 'loading' ? `Generating ${activeSkill} quiz...` : 'Grading your answers...'}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Select Skill */}
      {phase === 'select' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-500" /> Choose a Skill to Prove
          </h3>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map(skill => (
                <button key={skill} onClick={() => { setSelectedSkill(skill); setCustomSkill(''); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selectedSkill === skill ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                  {skill}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={customSkill} onChange={e => { setCustomSkill(e.target.value); setSelectedSkill(''); }}
              placeholder="Or type any skill (e.g. Docker, SQL, Figma)..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button onClick={startQuiz} disabled={!activeSkill.trim()}
              className="btn-primary px-5 py-2.5 flex items-center gap-1.5 disabled:opacity-40">
              Start <ChevronRight size={15} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Quiz */}
      {phase === 'quiz' && questions.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-600">{activeSkill} Quiz</span>
              <span className="text-sm text-gray-500">{currentQ + 1} / {questions.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-3">
              <p className="font-semibold text-gray-900 mb-4">{questions[currentQ]?.question}</p>
              <div className="space-y-2">
                {(questions[currentQ]?.options || []).map((opt, i) => {
                  const letter = optionLetter(opt);
                  const isSelected = selectedAnswers[currentQ] === opt;
                  return (
                    <button key={i} onClick={() => selectAnswer(opt)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 hover:border-blue-300 text-gray-700'}`}>
                      <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-2 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{letter}</span>
                      {opt.substring(3)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              {currentQ < questions.length - 1 ? (
                <button onClick={nextQuestion} disabled={!selectedAnswers[currentQ]}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 disabled:opacity-40">
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={submitQuiz} disabled={selectedAnswers.some(a => !a)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition-colors">
                  <CheckCircle size={15} /> Submit Quiz
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Results */}
      {phase === 'results' && results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className={`rounded-2xl p-5 text-center ${results.passed ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-500'} text-white shadow-lg`}>
            {results.passed ? <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" /> : <Award className="w-8 h-8 mx-auto mb-2 opacity-70" />}
            <div className="text-4xl font-black mb-1">{results.score}<span className="text-xl opacity-70">/{results.total}</span></div>
            <p className="font-semibold mb-1">{activeSkill} Assessment</p>
            <p className="text-sm opacity-90">{results.message}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl divide-y shadow-sm">
            {(results.results || []).map((r, i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                {r.isCorrect
                  ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  : <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 mb-0.5">{r.question}</p>
                  {!r.isCorrect && <p className="text-xs text-red-600 mb-1">Your answer: {r.yourAnswer}</p>}
                  <p className={`text-xs ${r.isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                    {r.isCorrect ? '✓ Correct' : `Correct: ${r.correctAnswer}`} — {r.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 btn-secondary flex items-center justify-center gap-1.5 py-2.5">
              <RotateCcw size={15} /> Try Another
            </button>
            <button onClick={() => { setPhase('select'); setSelectedSkill(activeSkill); setCustomSkill(''); setResults(null); }}
              className="flex-1 btn-primary flex items-center justify-center gap-1.5 py-2.5">
              Retake Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
