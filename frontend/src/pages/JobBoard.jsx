import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, MapPin, Briefcase, DollarSign, Plus, Filter, Brain } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const JOB_TYPES = ['All', 'full-time', 'part-time', 'contract', 'internship'];
const EXP_LEVELS = ['All', 'entry', 'mid', 'senior', 'lead'];
const TYPE_LABELS = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'contract': 'Contract', 'internship': 'Internship' };
const EXP_LABELS = { 'entry': 'Entry Level', 'mid': 'Mid Level', 'senior': 'Senior', 'lead': 'Lead' };
const EXP_COLORS = { 'entry': 'bg-emerald-100 text-emerald-700', 'mid': 'bg-blue-100 text-blue-700', 'senior': 'bg-violet-100 text-violet-700', 'lead': 'bg-amber-100 text-amber-700' };

const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

const JobBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 300);
    return () => clearTimeout(timer);
  }, [search, filter, expFilter]);

  useEffect(() => {
    // Pre-load applied jobs
    if (user?._id) {
      api.get(`/applications/candidate/${user._id}`)
        .then(res => {
          const ids = new Set(res.data.applications.map(a => a.jobId?._id));
          setAppliedIds(ids);
        }).catch(() => {});
    }
  }, [user?._id]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter !== 'All') params.jobType = filter;
      if (expFilter !== 'All') params.experienceLevel = expFilter;
      const res = await api.get('/jobs', { params });
      setJobs(res.data.jobs || []);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!user) return navigate('/login');
    if (user.role !== 'candidate') return toast.error('Only candidates can apply');
    setApplying(jobId);
    try {
      await api.post('/applications', { jobId });
      setAppliedIds(prev => new Set([...prev, jobId]));
      toast.success('Applied! AI is matching you to this role...');
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg?.includes('Already applied')) {
        setAppliedIds(prev => new Set([...prev, jobId]));
        toast('Already applied to this job');
      } else {
        toast.error(msg || 'Failed to apply');
      }
    } finally {
      setApplying(null);
    }
  };

  const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Job Board</h1>
          <p className="text-slate-500">{jobs.length} open positions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Job type row */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Type:</span>
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                filter === t
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
        {/* Experience level row */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Level:</span>
          {EXP_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setExpFilter(l)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                expFilter === l
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600'
              }`}
            >
              {EXP_LABELS[l] || l}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-16 w-full" />
              <div className="flex gap-2"><div className="skeleton h-6 w-16 rounded-full" /><div className="skeleton h-6 w-20 rounded-full" /></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No jobs found</p>
          <p className="text-slate-400 text-sm">Try different search terms or filters</p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isApplied = appliedIds.has(job._id);
            return (
              <motion.div
                key={job._id}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.15)' }}
                className="card cursor-pointer group flex flex-col"
                onClick={() => setSelectedJob(job)}
              >
                {/* Company */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                    {job.company?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-sm text-slate-500 truncate">{job.company}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />{job.location}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium">
                    {TYPE_LABELS[job.jobType] || job.jobType}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                    {job.experienceLevel}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{job.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skillsRequired?.slice(0, 4).map(s => (
                    <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{s}</span>
                  ))}
                  {job.skillsRequired?.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">+{job.skillsRequired.length - 4} more</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                    {job.salaryRange || 'Negotiable'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}/practice`); }}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1 transition-all"
                    >
                      <Brain size={12} /> Practice
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(job._id); }}
                      disabled={isApplied || applying === job._id}
                      className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                        isApplied
                          ? 'bg-emerald-50 text-emerald-600 cursor-default'
                          : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
                      }`}
                    >
                      {isApplied ? '✓ Applied' : applying === job._id ? '...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Job detail modal */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.title} size="lg">
        {selectedJob && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                {selectedJob.company?.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{selectedJob.company}</p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                  <span>{TYPE_LABELS[selectedJob.jobType] || selectedJob.jobType}</span>
                  <span className="capitalize">{selectedJob.experienceLevel}</span>
                </div>
              </div>
              <div className="ml-auto text-emerald-600 font-bold">{selectedJob.salaryRange}</div>
            </div>

            <div className="prose prose-slate max-w-none mb-6">
              <h4 className="font-bold text-slate-900 mb-2">About the Role</h4>
              <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-slate-900 mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skillsRequired?.map(s => (
                  <span key={s} className="skill-badge">{s}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { navigate(`/jobs/${selectedJob._id}/practice`); setSelectedJob(null); }}
                className="flex-1 border border-blue-200 text-blue-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <Brain size={16} /> Practice Interview
              </button>
              <Button
                onClick={() => { handleApply(selectedJob._id); setSelectedJob(null); }}
                disabled={appliedIds.has(selectedJob._id)}
                className="flex-1 justify-center"
                size="lg"
              >
                {appliedIds.has(selectedJob._id) ? '✓ Already Applied' : 'Apply Now'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobBoard;
