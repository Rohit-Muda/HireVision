import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { LayoutDashboard, Users, Calendar, Video, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/ui/Modal';

const COLUMNS = [
  { id: 'applied',   label: 'Applied',   emoji: '📥', color: 'bg-slate-100 border-slate-200',  header: 'bg-slate-200 text-slate-700' },
  { id: 'screened',  label: 'Screened',  emoji: '🔍', color: 'bg-amber-50 border-amber-200',   header: 'bg-amber-100 text-amber-700' },
  { id: 'interview', label: 'Interview', emoji: '🗣️', color: 'bg-emerald-50 border-emerald-200',header: 'bg-emerald-100 text-emerald-700' },
  { id: 'hired',     label: 'Hired',     emoji: '🎉', color: 'bg-violet-50 border-violet-200',  header: 'bg-violet-100 text-violet-700' },
  { id: 'rejected',  label: 'Rejected',  emoji: '❌', color: 'bg-red-50 border-red-200',        header: 'bg-red-100 text-red-600' },
];

const scoreColor = (s) => s >= 80 ? 'bg-emerald-100 text-emerald-700' : s >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600';

const KanbanCard = ({ application, provided, onProposeSlots }) => {
  const c = application.candidateId;
  const score = Math.round(application.matchScore || 0);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c?.name || 'Candidate')}&background=0f172a&color=ffffff&bold=true`} alt={c?.name} className="w-8 h-8 rounded-full shrink-0 border border-slate-200/60 shadow-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{c?.name}</p>
        </div>
        {score > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColor(score)}`}>
            {score}%
          </span>
        )}
      </div>

      {c?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {c.skills.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{s}</span>
          ))}
          {c.skills.length > 3 && <span className="text-[10px] text-slate-400">+{c.skills.length - 3}</span>}
        </div>
      )}

      {/* Phase 5 Interview Scheduling Widget on Card */}
      {application.stage === 'interview' && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
          {application.scheduledSlot ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <Calendar className="w-3 h-3 shrink-0" />
                {new Date(application.scheduledSlot).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                  timeZone: 'Asia/Kolkata'
                })}
              </span>
              {application.jitsiUrl && (
                <a
                  href={application.jitsiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2 py-1 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Video className="w-3 h-3" />
                  Join Jitsi Room
                </a>
              )}
            </div>
          ) : application.interviewSlots?.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {application.interviewSlots.length} Slots Proposed
              </span>
              <button
                onClick={() => onProposeSlots(application)}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors text-center"
              >
                Update Slots
              </button>
            </div>
          ) : (
            <button
              onClick={() => onProposeSlots(application)}
              className="text-[11px] font-bold text-white bg-brand-600 hover:bg-brand-700 px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              Propose Slots
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const KanbanPipeline = () => {
  const { id: jobId } = useParams();
  const [columns, setColumns] = useState({ applied: [], screened: [], interview: [], hired: [], rejected: [] });
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');
  
  // Scheduling Modal State
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [proposedSlots, setProposedSlots] = useState([{ time: '', label: '' }]);
  const [submittingSlots, setSubmittingSlots] = useState(false);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobRes] = await Promise.all([
        api.get(`/applications/job/${jobId}`),
        api.get(`/jobs/${jobId}`),
      ]);
      setColumns(appsRes.data.grouped || { applied: [], screened: [], interview: [], hired: [], rejected: [] });
      setJobTitle(jobRes.data.job?.title || 'Job Pipeline');
    } catch (err) {
      toast.error('Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = [...(columns[source.droppableId] || [])];
    const [moved] = srcCol.splice(source.index, 1);
    if (!moved) return;

    let newColumns;
    if (source.droppableId === destination.droppableId) {
      srcCol.splice(destination.index, 0, moved);
      newColumns = { ...columns, [source.droppableId]: srcCol };
    } else {
      const dstCol = [...(columns[destination.droppableId] || [])];
      dstCol.splice(destination.index, 0, { ...moved, stage: destination.droppableId });
      newColumns = {
        ...columns,
        [source.droppableId]: srcCol,
        [destination.droppableId]: dstCol,
      };
    }
    setColumns(newColumns);

    if (source.droppableId !== destination.droppableId) {
      try {
        await api.patch(`/applications/${moved._id}/stage`, { stage: destination.droppableId });
        toast.success(`Moved to ${destination.droppableId}`);
        // If moved to interview stage, prompt scheduling modal
        if (destination.droppableId === 'interview') {
          openSchedulingModal({ ...moved, stage: 'interview' });
        }
      } catch (err) {
        toast.error('Failed to update stage');
        fetchData();
      }
    }
  };

  const openSchedulingModal = (app) => {
    setSchedulingApp(app);
    if (app.interviewSlots && app.interviewSlots.length > 0) {
      const existing = app.interviewSlots.map(s => {
        // Convert to local datetime-local format (YYYY-MM-DDTHH:MM)
        const d = new Date(s.time);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        return { time: formatted, label: s.label };
      });
      setProposedSlots(existing);
    } else {
      setProposedSlots([{ time: '', label: '' }]);
    }
  };

  const addSlotRow = () => {
    if (proposedSlots.length >= 3) {
      toast.error('Maximum of 3 slots allowed');
      return;
    }
    setProposedSlots([...proposedSlots, { time: '', label: '' }]);
  };

  const removeSlotRow = (index) => {
    const next = proposedSlots.filter((_, i) => i !== index);
    setProposedSlots(next.length === 0 ? [{ time: '', label: '' }] : next);
  };

  const handleSlotChange = (index, field, value) => {
    const next = [...proposedSlots];
    next[index][field] = value;
    setProposedSlots(next);
  };

  const submitProposedSlots = async (e) => {
    e.preventDefault();
    const validSlots = proposedSlots.filter(s => s.time);
    if (validSlots.length === 0) {
      toast.error('Please add at least 1 valid date & time');
      return;
    }

    setSubmittingSlots(true);
    try {
      await api.post('/scheduling/propose-slots', {
        applicationId: schedulingApp._id,
        slots: validSlots.map(s => ({
          time: new Date(s.time).toISOString(),
          label: s.label || undefined
        }))
      });
      toast.success('Interview slots proposed successfully');
      setSchedulingApp(null);
      fetchData(); // reload board to reflect changes
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to propose interview slots');
    } finally {
      setSubmittingSlots(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-64 mb-6" />
        <div className="flex gap-4 overflow-x-auto">
          {COLUMNS.map(c => <div key={c.id} className="skeleton w-64 h-96 shrink-0 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-6 h-6 text-brand-600" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{jobTitle}</h1>
          <p className="text-slate-500 text-sm">Drag candidates between stages</p>
        </div>
      </motion.div>

      <div className="overflow-x-auto pb-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => {
              const items = columns[col.id] || [];
              return (
                <div key={col.id} className={`w-64 rounded-2xl border-2 ${col.color} flex flex-col`}>
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.header}`}>
                    <div className="flex items-center gap-2">
                      <span>{col.emoji}</span>
                      <span className="font-bold text-sm">{col.label}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 text-xs font-bold">
                      {items.length}
                    </span>
                  </div>

                  {/* Droppable area */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-3 min-h-[200px] transition-colors rounded-b-xl ${
                          snapshot.isDraggingOver ? 'bg-brand-50/50' : ''
                        }`}
                      >
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center">
                            <p className="text-xs text-slate-400">Drop candidates here</p>
                          </div>
                        )}
                        {items.map((app, idx) => (
                          <Draggable key={app._id} draggableId={app._id} index={idx}>
                            {(provided) => (
                              <KanbanCard
                                application={app}
                                provided={provided}
                                onProposeSlots={openSchedulingModal}
                              />
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Propose Slots Modal */}
      <Modal
        isOpen={!!schedulingApp}
        onClose={() => setSchedulingApp(null)}
        title={`Propose Interview Slots: ${schedulingApp?.candidateId?.name || 'Candidate'}`}
        size="md"
      >
        <form onSubmit={submitProposedSlots} className="p-6">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Propose up to 3 slots</p>
              <p className="text-xs text-emerald-700">The candidate will receive these choices on their dashboard and select one to instantly create a Jitsi video meeting room.</p>
            </div>
          </div>

          <div className="space-y-4">
            {proposedSlots.map((slot, index) => (
              <div key={index} className="flex gap-3 items-end p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={slot.time}
                      onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quick Label (e.g. "Morning Slot", optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Early Morning"
                      value={slot.label}
                      onChange={(e) => handleSlotChange(index, 'label', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                {proposedSlots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlotRow(index)}
                    className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {proposedSlots.length < 3 && (
            <button
              type="button"
              onClick={addSlotRow}
              className="mt-4 flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Another Slot Option
            </button>
          )}

          <div className="flex gap-3 mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setSchedulingApp(null)}
              className="btn-secondary w-1/2 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingSlots}
              className="btn-primary w-1/2 justify-center"
            >
              {submittingSlots ? 'Proposing...' : 'Send Slot Proposal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default KanbanPipeline;
