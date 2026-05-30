import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Briefcase, Users, TrendingUp, BarChart3, PlusCircle, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ label, value, icon: Icon, color, suffix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-slate-900">{value}{suffix}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </motion.div>
);

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, inPipeline: 0, avgMatchScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, statsRes] = await Promise.all([
        api.get('/jobs/recruiter/mine'),
        api.get('/applications/recruiter/stats').catch(() => ({ data: {} })),
      ]);
      setJobs(jobsRes.data.jobs || []);
      if (statsRes.data) setStats(prev => ({ ...prev, ...statsRes.data }));
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Jobs Posted', value: stats.totalJobs || jobs.length, icon: Briefcase, color: 'bg-brand-50 text-brand-600' },
    { label: 'Total Applicants', value: stats.totalApplications, icon: Users, color: 'bg-violet-50 text-violet-600' },
    { label: 'In Pipeline', value: stats.inPipeline, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Avg Match Score', value: stats.avgMatchScore || 0, icon: BarChart3, color: 'bg-amber-50 text-amber-600', suffix: '%' },
  ];

  const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div {...fadeUp} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {user?.companyName || 'Recruiter'} Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary gap-2">
          <PlusCircle className="w-5 h-5" />
          Post New Job
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </motion.div>

      {/* Jobs list */}
      <div>
        <h2 className="section-heading">Your Jobs</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-20" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No jobs posted yet</p>
            <p className="text-slate-400 text-sm mb-4">Post your first job to start receiving matched candidates</p>
            <Link to="/recruiter/post-job" className="btn-primary">Post First Job</Link>
          </div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
            {jobs.map((job) => (
              <motion.div key={job._id} variants={fadeUp} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.company || 'Company')}&background=f1f5f9&color=0f172a&bold=true`} alt={job.company} className="w-10 h-10 rounded-xl shrink-0 border border-slate-200/60 shadow-sm" />
                    <div>
                      <h3 className="font-bold text-slate-900">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                        <span>{job.location}</span>
                        <span className="capitalize">{job.jobType}</span>
                        <span className="capitalize">{job.experienceLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/recruiter/jobs/${job._id}`}
                      className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      View Candidates <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/recruiter/jobs/${job._id}/pipeline`}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 flex items-center gap-1 transition-colors"
                    >
                      Pipeline <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      {/* Find Talent CTA */}
      <motion.div {...fadeUp} className="mt-6 card bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Looking for specific talent?</h3>
            <p className="text-sm text-slate-500 mt-0.5">Search all candidates by skills and location</p>
          </div>
          <Link to="/recruiter/search" className="btn-primary gap-2 shrink-0">
            <Search className="w-4 h-4" />
            Find Talent
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterDashboard;
