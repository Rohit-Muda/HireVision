import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle, Clock, Briefcase, Calendar, Video, AlertCircle, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STAGES = ['applied', 'screened', 'interview', 'hired'];
const STAGE_CONFIG = {
  applied:   { label: 'Applied',   color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  screened:  { label: 'Screened',  color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  interview: { label: 'Interview', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  hired:     { label: 'Hired 🎉', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
};

const scoreColor = (s) => s >= 80 ? 'text-emerald-600 bg-emerald-50' : s >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';

const StageStepper = ({ currentStage }) => {
  const idx = STAGES.indexOf(currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <div className="flex items-center gap-1">
      {STAGES.map((stage, i) => {
        const done = !isRejected && i <= idx;
        const active = !isRejected && i === idx;
        return (
          <div key={stage} className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              done
                ? 'bg-brand-600 text-white'
                : 'bg-slate-200 text-slate-400'
            } ${active ? 'ring-2 ring-brand-300 ring-offset-1' : ''}`}>
              {done && i < idx ? '✓' : i + 1}
            </div>
            {i < STAGES.length - 1 && (
              <div className={`w-8 h-0.5 ${i < idx && !isRejected ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
      {isRejected && <span className="ml-2 text-xs text-red-500 font-medium">Rejected</span>}
    </div>
  );
};

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingIdx, setConfirmingIdx] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  const fetchData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/applications/candidate/${user._id}`);
      setApplications(res.data.applications || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSlot = async (applicationId, slotIndex) => {
    setConfirmingIdx(`${applicationId}-${slotIndex}`);
    try {
      const res = await api.post('/scheduling/confirm-slot', {
        applicationId,
        slotIndex
      });
      toast.success('Interview scheduled successfully! Jitsi link generated.');
      fetchData(); // refresh list to show scheduled slot and link
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to confirm interview slot');
    } finally {
      setConfirmingIdx(null);
    }
  };

  const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Applications</h1>
        <p className="text-slate-500">{applications.length} job{applications.length !== 1 ? 's' : ''} applied</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No applications yet</p>
          <p className="text-slate-400 text-sm">Browse jobs and apply with one click</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {applications.map(app => (
            <motion.div key={app._id} variants={fadeUp} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Job info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center text-brand-700 font-bold shrink-0">
                      {app.jobId?.company?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{app.jobId?.title || 'Job'}</h3>
                      <p className="text-sm text-slate-500">{app.jobId?.company} · {app.jobId?.location}</p>
                    </div>
                  </div>

                  {/* Stage stepper */}
                  <div className="mt-3">
                    <StageStepper currentStage={app.stage} />
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4 shrink-0">
                  {app.matchScore > 0 && (
                    <div className={`px-3 py-1.5 rounded-xl text-sm font-bold ${scoreColor(app.matchScore)}`}>
                      {Math.round(app.matchScore)}% match
                    </div>
                  )}
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${STAGE_CONFIG[app.stage]?.color}`}>
                    {STAGE_CONFIG[app.stage]?.label}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>

              {/* Match explanation */}
              {app.matchExplanation && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500 italic">"{app.matchExplanation}"</p>
                </div>
              )}

              {/* Phase 5: Interview Scheduling Section */}
              {app.stage === 'interview' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {app.scheduledSlot ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Your Video Interview is Scheduled!</p>
                          <p className="text-xs text-emerald-700">
                            Time: {new Date(app.scheduledSlot).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                              timeZone: 'Asia/Kolkata'
                            })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={app.jitsiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 gap-2 shrink-0 py-2 text-sm text-white flex items-center justify-center font-bold px-4 rounded-xl shadow-sm transition-colors"
                      >
                        Join Room (Jitsi)
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : app.interviewSlots?.length > 0 ? (
                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                      <div className="flex gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                        <p className="text-xs font-bold text-slate-800">Please confirm your preferred interview slot:</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {app.interviewSlots.map((slot, index) => {
                          const isConfirming = confirmingIdx === `${app._id}-${index}`;
                          return (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between gap-3 hover:border-brand-300 transition-colors">
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {new Date(slot.time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </p>
                                <p className="text-lg font-extrabold text-brand-600">
                                  {new Date(slot.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {slot.label && <span className="text-[10px] text-slate-400 font-medium">({slot.label})</span>}
                              </div>
                              <button
                                onClick={() => handleConfirmSlot(app._id, index)}
                                disabled={confirmingIdx !== null}
                                className="w-full text-xs font-bold py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                              >
                                {isConfirming ? '...' : <><Check className="w-3.5 h-3.5" /> Confirm</>}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 text-slate-600">
                      <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-850">Interview Stage Reached</p>
                        <p className="text-xs text-slate-400">The recruiter will propose date/time slots for your interview shortly. You will be able to confirm a slot and get the Jitsi Meet video link here.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MyApplications;
