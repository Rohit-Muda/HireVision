import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, CheckCircle, XCircle, Play, MapPin, Briefcase, Users, LayoutDashboard, Zap } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/ui/Modal';

const scoreColor = (s) =>
  s >= 80 ? { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', stroke: '#10b981', label: 'Excellent Match' }
  : s >= 60 ? { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', stroke: '#f59e0b', label: 'Good Match' }
  : { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', stroke: '#ef4444', label: 'Partial Match' };

const CircleScore = ({ score }) => {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const { stroke, text } = scoreColor(score);
  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${pct * circ} ${circ}` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${text}`}>
        {Math.round(score)}%
      </span>
    </div>
  );
};

const JobCandidates = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoCandidate, setVideoCandidate] = useState(null);
  // ✅ Fix: track moving by applicationId, not candidateId
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobRes, candidatesRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/jobs/${id}/candidates`),
      ]);
      setJob(jobRes.data.job);
      setCandidates(candidatesRes.data.candidates || []);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: use applicationId directly from the candidates response (no extra GET)
  const moveToScreening = async (applicationId, candidateId) => {
    if (!applicationId) {
      toast.error('Application ID not found. Please refresh.');
      return;
    }
    setMovingId(candidateId);
    try {
      await api.patch(`/applications/${applicationId}/stage`, { stage: 'screened' });
      toast.success('Moved to Screening!');
      // Update local state to reflect change
      setCandidates(prev =>
        prev.map(c =>
          c.candidate._id === candidateId ? { ...c, stage: 'screened' } : c
        )
      );
    } catch (err) {
      toast.error('Failed to update stage');
    } finally {
      setMovingId(null);
    }
  };

  const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container">
      {/* Job header */}
      {job && (
        <motion.div {...fadeUp} className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{job.title}</h1>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.skillsRequired?.map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link to={`/recruiter/jobs/${id}/pipeline`} className="btn-primary gap-2 text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Pipeline
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Candidates header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-heading mb-0 flex items-center gap-3">
          AI-Ranked Candidates
          {!loading && (
            <span className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
              {candidates.length} matched
            </span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="skeleton w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton h-4 w-64" />
                  <div className="flex gap-2"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-20 rounded-full" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No candidates with video resumes yet</p>
          <p className="text-slate-400 text-sm mt-1">Share HireVision with candidates to start receiving AI-analyzed applications.</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {candidates.map(({ candidate, matchScore, matchExplanation, matchedSkills, missingSkills, applicationId }, idx) => {
            const { text, bg, border, label } = scoreColor(matchScore);
            const isMoving = movingId === candidate._id;
            return (
              <motion.div key={candidate._id} variants={fadeUp} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: candidate info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {candidate.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{candidate.name}</h3>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">Top Match</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mb-3">{candidate.headline || candidate.experienceSummary?.substring(0, 80)}</p>

                      {/* Explanation */}
                      {matchExplanation && (
                        <p className="text-sm text-slate-600 italic mb-3 border-l-2 border-brand-300 pl-3">
                          "{matchExplanation}"
                        </p>
                      )}

                      {/* AI Summary */}
                      {candidate.aiSummary && (
                        <div className="mb-3 p-2.5 rounded-lg bg-brand-50 border border-brand-100">
                          <div className="flex items-center gap-1 mb-1">
                            <Zap className="w-3 h-3 text-brand-500" />
                            <span className="text-xs font-semibold text-brand-600">AI Profile</span>
                          </div>
                          <p className="text-xs text-slate-600 italic">"{candidate.aiSummary}"</p>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills?.map(s => (
                          <span key={s} className="skill-matched">
                            <CheckCircle className="w-3 h-3" />{s}
                          </span>
                        ))}
                        {missingSkills?.map(s => (
                          <span key={s} className="skill-missing">
                            <XCircle className="w-3 h-3" />{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: score + actions */}
                  <div className="flex md:flex-col items-center gap-4 md:items-end shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <CircleScore score={matchScore} />
                      <span className={`text-xs font-semibold ${text}`}>{label}</span>
                    </div>

                    {/* Communication score */}
                    {candidate.communicationScore > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Comm. Score</p>
                        <p className="text-lg font-bold text-brand-600">{candidate.communicationScore}/10</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {candidate.videoUrl && (
                        <button
                          onClick={() => setVideoCandidate(candidate)}
                          className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium"
                        >
                          <Play className="w-4 h-4" />
                          Watch
                        </button>
                      )}
                      {/* ✅ Fix: pass applicationId directly, no extra API call */}
                      <button
                        onClick={() => moveToScreening(applicationId, candidate._id)}
                        disabled={isMoving}
                        className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-medium disabled:opacity-60"
                      >
                        {isMoving ? '...' : <>Shortlist <ArrowRight className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Video Modal */}
      <Modal isOpen={!!videoCandidate} onClose={() => setVideoCandidate(null)} size="lg">
        {videoCandidate && (
          <div>
            <div className="bg-slate-900 aspect-video">
              <video
                src={videoCandidate.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold text-slate-900 text-xl mb-1">{videoCandidate.name}</h3>
              <p className="text-slate-500 mb-4">{videoCandidate.headline}</p>
              {videoCandidate.aiSummary && (
                <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                  <p className="text-sm text-brand-700 italic">"{videoCandidate.aiSummary}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobCandidates;
