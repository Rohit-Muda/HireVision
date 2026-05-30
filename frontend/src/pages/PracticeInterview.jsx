import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, ChevronRight, CheckCircle, Star, Loader2, ArrowLeft, RotateCcw, Trophy, Target, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PracticeInterview() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('ready'); // ready | loading | answering | submitting | results
  const [job, setJob] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data.job)).catch(() => {});
  }, [jobId]);

  const startPractice = async () => {
    setPhase('loading');
    try {
      const { data } = await api.post('/interview/generate-questions', { jobId });
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(''));
      setCurrentQ(0); setCurrentAnswer('');
      setPhase('answering');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate questions.');
      setPhase('ready');
    }
  };

  const nextQuestion = () => {
    const updated = [...answers];
    updated[currentQ] = currentAnswer;
    setAnswers(updated);
    setCurrentAnswer(answers[currentQ + 1] || '');
    setCurrentQ(q => q + 1);
  };

  const submitAnswers = async () => {
    const finalAnswers = [...answers];
    finalAnswers[currentQ] = currentAnswer;
    setPhase('submitting');
    try {
      const { data } = await api.post('/interview/evaluate-answers', { jobId, questions, answers: finalAnswers });
      setResults(data.evaluation);
      setPhase('results');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Evaluation failed.');
      setPhase('answering');
    }
  };

  const RatingStars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} size={13} className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />)}
    </div>
  );

  if (phase === 'loading' || phase === 'submitting') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">{phase === 'loading' ? 'AI is crafting your questions...' : 'Evaluating your answers...'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Interview Practice</h1>
            {job && <p className="text-sm text-gray-500">{job.title} · {job.company}</p>}
          </div>
        </div>

        {phase === 'ready' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Practice This Interview</h2>
            <p className="text-gray-500 text-sm mb-8">
              Get 5 AI-generated questions tailored to the <strong>{job?.title || 'role'}</strong>. Answer them, then receive detailed feedback and a readiness score.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={startPractice} className="btn-primary flex items-center gap-2 justify-center px-8 py-3 text-base">
                Start Practice <ChevronRight size={18} />
              </button>
              <button onClick={() => navigate(-1)} className="btn-secondary px-6 py-3 text-base">Back to Jobs</button>
            </div>
          </motion.div>
        )}

        {phase === 'answering' && questions.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <span>{Math.round((currentQ / questions.length) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-5 overflow-hidden">
                <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${(currentQ / questions.length) * 100}%` }} />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{currentQ + 1}</div>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize mb-2 inline-block ${
                      questions[currentQ]?.type === 'technical' ? 'bg-blue-100 text-blue-700' :
                      questions[currentQ]?.type === 'behavioral' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'}`}>{questions[currentQ]?.type}</span>
                    <p className="text-gray-900 font-semibold text-lg">{questions[currentQ]?.question}</p>
                  </div>
                </div>
                <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific and use examples."
                  className="w-full h-36 p-4 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" autoFocus />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-400">{currentAnswer.length} characters</p>
                  {currentQ < questions.length - 1 ? (
                    <button onClick={nextQuestion} disabled={currentAnswer.trim().length < 10} className="btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-40">
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button onClick={submitAnswers} disabled={currentAnswer.trim().length < 10} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40 transition-colors">
                      <CheckCircle size={16} /> Submit All
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {phase === 'results' && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg">
              <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
              <div className="text-5xl font-black mb-1">{results.overallReadinessScore}<span className="text-2xl opacity-70">/100</span></div>
              <p className="text-blue-100 text-sm mb-3">Interview Readiness Score</p>
              <p className="text-white font-medium">{results.overallFeedback}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-1"><TrendingUp size={14} className="text-green-600" /><span className="text-xs font-semibold text-green-700 uppercase">Strength</span></div>
                <p className="text-gray-800 text-sm">{results.topStrength}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-1 mb-1"><Target size={14} className="text-amber-600" /><span className="text-xs font-semibold text-amber-700 uppercase">Improve</span></div>
                <p className="text-gray-800 text-sm">{results.mainGap}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
              {(results.evaluations || []).map((ev, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate">{questions[i]?.question}</p>
                      <RatingStars rating={ev.rating} />
                    </div>
                    <p className="text-xs text-gray-500">{ev.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setResults(null); setPhase('ready'); }} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
                <RotateCcw size={16} /> Try Again
              </button>
              <button onClick={() => navigate('/jobs')} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">Browse Jobs</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
