import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, MapPin, Zap, BarChart3, Play, X, Users, Filter, FileText, Download } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/ui/Modal';

const scoreColor = (s) =>
  s >= 8 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
  : s >= 6 ? 'text-amber-600 bg-amber-50 border-amber-200'
  : 'text-red-500 bg-red-50 border-red-200';

const CandidateSearch = () => {
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (skills.trim()) params.skills = skills.trim();
      if (location.trim()) params.location = location.trim();
      const res = await api.get('/candidates/search', { params });
      setCandidates(res.data.candidates || []);
    } catch (err) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load all candidates on mount
  useEffect(() => {
    handleSearch();
  }, []);

  const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div {...fadeUp} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Candidate <span className="text-slate-900">Search</span>
        </h1>
        <p className="text-slate-500 mt-1">Find top talent with AI-powered profiles and video resumes</p>
      </motion.div>

      {/* Search Form */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="card mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="Skills (e.g. React, Python, AWS)"
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location (e.g. Mumbai, Remote)"
              className="input-field pl-10 w-full"
            />
          </div>
          <button type="submit" className="btn-primary shrink-0 gap-2" disabled={loading}>
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Search
          </button>
        </form>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-slate-500 font-medium self-center">Quick:</span>
          {['React', 'Python', 'Node.js', 'Java', 'Data Science', 'Flutter'].map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => { setSkills(skill); setTimeout(() => handleSearch(), 100); }}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
            >
              {skill}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-heading mb-0 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-600" />
          {searched ? `${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} found` : 'All Candidates'}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 skeleton rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-40" />
                  <div className="skeleton h-3 w-64" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-20 rounded-full" />
                    <div className="skeleton h-6 w-20 rounded-full" />
                    <div className="skeleton h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No candidates found</p>
          <p className="text-slate-400 text-sm mt-1">Try different skills or leave filters empty to see all candidates</p>
          <button onClick={() => { setSkills(''); setLocation(''); handleSearch(); }} className="btn-secondary text-sm mt-4">
            Show All Candidates
          </button>
        </div>
      ) : (
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {candidates.map((candidate) => (
            <motion.div
              key={candidate._id}
              variants={fadeUp}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Avatar + name */}
                <div className="flex items-start gap-4 flex-1">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'Candidate')}&background=0f172a&color=ffffff&bold=true`} alt={candidate.name} className="w-14 h-14 rounded-full shrink-0 group-hover:scale-105 transition-transform border-2 border-white shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{candidate.name}</h3>
                      {candidate.videoAnalyzedAt && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">Video Profile</span>
                      )}
                      {candidate.resumeUrl && (
                        <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">Has PDF Resume</span>
                      )}
                    </div>
                    {candidate.headline && (
                      <p className="text-slate-500 text-sm mb-2">{candidate.headline}</p>
                    )}
                    {candidate.aiSummary && (
                      <div className="p-2.5 rounded-lg bg-brand-50 border border-brand-100 mb-3">
                        <p className="text-xs text-slate-600 italic">"{candidate.aiSummary}"</p>
                      </div>
                    )}
                    {/* Skills */}
                    {candidate.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 6).map(s => (
                          <span key={s} className="skill-badge text-xs">{s}</span>
                        ))}
                        {candidate.skills.length > 6 && (
                          <span className="text-xs text-slate-400 self-center">+{candidate.skills.length - 6} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Scores */}
                <div className="flex md:flex-col items-center gap-4 md:items-end shrink-0">
                  {candidate.communicationScore > 0 && (
                    <div className={`text-center px-3 py-2 rounded-xl border ${scoreColor(candidate.communicationScore)}`}>
                      <p className="text-xs font-medium opacity-70">Comm. Score</p>
                      <p className="text-xl font-extrabold">{candidate.communicationScore}/10</p>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCandidate(candidate); }}
                    className="btn-primary text-sm py-2 px-4 gap-1.5"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Candidate Profile Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || 'Candidate Profile'}
        size="lg"
      >
        {selectedCandidate && (
          <div className="p-6 space-y-5">
            {/* Video */}
            {selectedCandidate.videoUrl && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-brand-600" /> Video Resume
                </p>
                <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                  <video src={selectedCandidate.videoUrl} controls className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* AI Summary */}
            {selectedCandidate.aiSummary && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-brand-700 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> AI Profile Summary
                </p>
                <p className="text-sm text-slate-700 italic">"{selectedCandidate.aiSummary}"</p>
              </div>
            )}

            {/* Scores row */}
            <div className="grid grid-cols-2 gap-3">
              {selectedCandidate.communicationScore > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">Communication Score</p>
                  <p className="text-2xl font-extrabold text-brand-600">{selectedCandidate.communicationScore}/10</p>
                </div>
              )}
              {selectedCandidate.skills?.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 mb-1">Total Skills</p>
                  <p className="text-2xl font-extrabold text-violet-600">{selectedCandidate.skills.length}</p>
                </div>
              )}
            </div>

            {/* Skills */}
            {selectedCandidate.skills?.length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map(s => (
                    <span key={s} className="skill-badge text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Summary */}
            {selectedCandidate.experienceSummary && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-brand-500" /> Experience
                </p>
                <p className="text-sm text-slate-600">{selectedCandidate.experienceSummary}</p>
              </div>
            )}

            {/* PDF Resume */}
            {selectedCandidate.resumeUrl && (
              <div>
                <p className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-violet-600" /> PDF Resume
                </p>
                <a
                  href={selectedCandidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-semibold text-sm hover:bg-violet-100 transition-colors w-fit"
                >
                  <Download className="w-4 h-4" /> Download PDF Resume
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidateSearch;
