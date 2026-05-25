import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { LayoutDashboard, Users } from 'lucide-react';
import api from '../services/api';

const COLUMNS = [
  { id: 'applied',   label: 'Applied',   emoji: '📥', color: 'bg-slate-100 border-slate-200',  header: 'bg-slate-200 text-slate-700' },
  { id: 'screened',  label: 'Screened',  emoji: '🔍', color: 'bg-amber-50 border-amber-200',   header: 'bg-amber-100 text-amber-700' },
  { id: 'interview', label: 'Interview', emoji: '🗣️', color: 'bg-emerald-50 border-emerald-200',header: 'bg-emerald-100 text-emerald-700' },
  { id: 'hired',     label: 'Hired',     emoji: '🎉', color: 'bg-violet-50 border-violet-200',  header: 'bg-violet-100 text-violet-700' },
  { id: 'rejected',  label: 'Rejected',  emoji: '❌', color: 'bg-red-50 border-red-200',        header: 'bg-red-100 text-red-600' },
];

const scoreColor = (s) => s >= 80 ? 'bg-emerald-100 text-emerald-700' : s >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600';

const KanbanCard = ({ application, provided }) => {
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
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {c?.name?.charAt(0)}
        </div>
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
        <div className="flex flex-wrap gap-1">
          {c.skills.slice(0, 3).map(s => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
          ))}
          {c.skills.length > 3 && <span className="text-xs text-slate-400">+{c.skills.length - 3}</span>}
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
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    const srcCol = [...(columns[source.droppableId] || [])];
    const dstCol = [...(columns[destination.droppableId] || [])];
    const [moved] = srcCol.splice(source.index, 1);

    if (!moved) return;

    // Optimistic update
    const newColumns = {
      ...columns,
      [source.droppableId]: srcCol,
      [destination.droppableId]: source.droppableId === destination.droppableId
        ? srcCol
        : [...dstCol.slice(0, destination.index), { ...moved, stage: destination.droppableId }, ...dstCol.slice(destination.index)],
    };
    setColumns(newColumns);

    try {
      await api.patch(`/applications/${moved._id}/stage`, { stage: destination.droppableId });
      toast.success(`Moved to ${destination.droppableId}`);
    } catch (err) {
      toast.error('Failed to update stage');
      // Revert
      fetchData();
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
                              <KanbanCard application={app} provided={provided} />
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
    </div>
  );
};

export default KanbanPipeline;
