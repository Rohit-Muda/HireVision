import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Video, Zap, Briefcase, ChevronRight, BarChart3, Play, X, FileVideo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/ui/Modal';

// ─── Circular SVG score gauge ─────────────────────────────────────────────────
const ScoreGauge = ({ score, max = 10 }) => {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const strokeColor = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#ef4444';
  const label = score >= 9 ? 'Excellent' : score >= 7 ? 'Good' : score >= 5 ? 'Average' : 'Needs Work';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="8"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${pct * circumference} ${circumference}` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-extrabold"
            style={{ color: strokeColor }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-500">/10</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-semibold" style={{ color: strokeColor }}>{label}</span>
    </div>
  );
};

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // ✅ Fix: only check videoAnalyzedAt — communicationScore can legitimately be 0
  const hasVideo = !!user?.videoAnalyzedAt;

  useEffect(() => {
    if (user?._id) {
      setLoadingApps(true);
      api.get(`/applications/candidate/${user._id}`)
        .then(res => setApplications(res.data.applications || []))
        .catch(() => toast.error('Failed to load applications'))
        .finally(() => setLoadingApps(false));
    }
  }, [user?._id]);

  const stageConfig = {
    applied:   { label: 'Applied',   color: 'stage-applied' },
    screened:  { label: 'Screened',  color: 'stage-screened' },
    interview: { label: 'Interview', color: 'stage-interview' },
    hired:     { label: 'Hired 🎉', color: 'stage-hired' },
    rejected:  { label: 'Rejected',  color: 'stage-rejected' },
  };

  const scoreColor = (score) =>
    score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="page-container">
      {/* Welcome header */}
      <motion.div {...fadeUp} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {hasVideo ? 'Your AI-powered profile is live.' : "Let's build your AI profile to get matched to jobs."}
        </p>
      </motion.div>

      {/* ── STATE 1: No video ─────────────────────────────────────────────── */}
      {!hasVideo && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-16 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center mx-auto mb-6">
            <Video className="w-10 h-10 text-brand-600 animate-float" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Build your AI-powered profile</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Record a 60-second video resume. Gemini AI will extract your skills, score your communication,
            and instantly match you to the best jobs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/record" className="btn-primary text-lg px-8 py-4 gap-3">
              <Video className="w-5 h-5" />
              Record Video Resume
            </Link>
            {/* ✅ Fix: Upload button navigates to record page (full upload flow there) */}
            <Link to="/record" className="btn-secondary text-base px-6 py-3 gap-2">
              <FileVideo className="w-4 h-4" />
              Upload Video Instead
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── STATE 2: Video analyzed ───────────────────────────────────────── */}
      {hasVideo && (
        <>
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Video player */}
            <motion.div variants={fadeUp} className="card !p-0 overflow-hidden">
              <div className="bg-slate-900 aspect-video flex items-center justify-center relative">
                {user?.videoUrl ? (
                  <video
                    src={user.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white/60 px-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center mx-auto mb-3">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white/80">Video analyzed via Gemini AI</p>
                    <p className="text-xs text-white/40 mt-1">Video file not stored (AI analysis saved)</p>
                    {user?.videoTranscript && (
                      <button
                        onClick={() => setTranscriptOpen(true)}
                        className="mt-3 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition font-medium"
                      >
                        Read Transcript
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{user?.headline || 'Video Resume'}</p>
                  <p className="text-sm text-slate-500">{user?.location || 'Ready for matching'}</p>
                </div>
                <Link to="/record" className="text-sm text-brand-600 font-semibold hover:underline flex items-center gap-1">
                  Re-record <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* AI Results */}
            <motion.div variants={fadeUp} className="card">
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-600" />
                AI Analysis Results
              </h3>

              <div className="flex items-start gap-6 mb-5">
                <ScoreGauge score={user?.communicationScore ?? 0} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-500 mb-1">Communication Score</p>
                  {user?.confidenceIndicators && (
                    <p className="text-sm text-slate-600 italic">"{user.confidenceIndicators}"</p>
                  )}
                </div>
              </div>

              {/* Skills */}
              {user?.skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Detected Skills</p>
                  <motion.div variants={stagger} className="flex flex-wrap gap-2">
                    {user.skills.map((s) => (
                      <motion.span key={s} variants={fadeUp} className="skill-badge">{s}</motion.span>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* AI Summary */}
              {user?.aiSummary && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-100">
                  <p className="text-sm font-semibold text-brand-700 mb-1">AI Summary</p>
                  <p className="text-slate-700 text-sm leading-relaxed italic">"{user.aiSummary}"</p>
                </div>
              )}

              {/* View transcript button */}
              {user?.videoTranscript && (
                <button
                  onClick={() => setTranscriptOpen(true)}
                  className="mt-4 w-full text-sm font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 py-2.5 rounded-xl transition-all hover:bg-brand-50"
                >
                  View Full Transcript
                </button>
              )}
            </motion.div>
          </motion.div>

          {/* Experience Summary */}
          {user?.experienceSummary && (
            <motion.div variants={fadeUp} className="card mb-8">
              <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                Experience Summary
              </h3>
              <p className="text-slate-600">{user.experienceSummary}</p>
            </motion.div>
          )}
        </>
      )}

      {/* ── APPLICATIONS ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading mb-0">My Applications</h2>
          <Link to="/jobs" className="btn-primary text-sm py-2 px-4">
            <Briefcase className="w-4 h-4" />
            Browse Jobs
          </Link>
        </div>

        {loadingApps ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 skeleton w-48 mb-3" />
                <div className="h-3 skeleton w-32" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No applications yet</p>
            <p className="text-slate-400 text-sm mb-4">Browse open jobs and apply with one click</p>
            <Link to="/jobs" className="btn-primary text-sm">Explore Jobs</Link>
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-4">
            {applications.map((app) => (
              <motion.div key={app._id} variants={fadeUp} className="card flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{app.jobId?.title}</h4>
                  <p className="text-sm text-slate-500">{app.jobId?.company} · {app.jobId?.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  {app.matchScore > 0 && (
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${scoreColor(app.matchScore)}`}>
                      {Math.round(app.matchScore)}% match
                    </span>
                  )}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${stageConfig[app.stage]?.color}`}>
                    {stageConfig[app.stage]?.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Transcript Modal */}
      <Modal isOpen={transcriptOpen} onClose={() => setTranscriptOpen(false)} title="Video Transcript">
        <div className="p-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto">
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
              {user?.videoTranscript || 'No transcript available.'}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-3">Transcribed by Gemini 2.5 Flash AI</p>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateDashboard;
