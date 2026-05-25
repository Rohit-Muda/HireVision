import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Zap, Users, BarChart3, ChevronRight, Star, ArrowRight } from 'lucide-react';

const Landing = () => {
  const steps = [
    { icon: Video, title: 'Record Your Story', desc: 'Record a 60-second video resume. Show your personality, not just your resume.', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, title: 'AI Analyzes Everything', desc: 'Gemini AI transcribes your speech, extracts skills, and scores your communication.', color: 'from-violet-500 to-purple-500' },
    { icon: Users, title: 'Get Matched Instantly', desc: 'Our semantic AI matches you to jobs with an explainable score — not keyword spam.', color: 'from-rose-500 to-pink-500' },
  ];

  const stats = [
    { value: '87%', label: 'Faster Screening' },
    { value: '3x', label: 'Better Matches' },
    { value: '60s', label: 'All You Need' },
    { value: '0₹', label: 'Always Free' },
  ];

  return (
    <div className="min-h-screen bg-mesh overflow-hidden">
      {/* Hero */}
      <div className="relative pt-20 pb-32 px-4">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-300/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4 text-brand-600" />
            Powered by Gemini 2.5 Flash AI
            <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-xs font-bold">NEW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6"
          >
            Your Video.{' '}
            <span className="text-gradient">Your Story.</span>
            <br />Your Next Job.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered video resumes that show who you <em>really</em> are — not just what's on paper.
            Candidates record. AI analyzes. Recruiters hire smarter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register?role=candidate" className="btn-primary text-lg px-8 py-4 gap-3">
              <Video className="w-5 h-5" />
              I'm a Candidate
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register?role=recruiter" className="btn-secondary text-lg px-8 py-4 gap-3">
              <Users className="w-5 h-5" />
              I'm a Recruiter
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-8 text-sm text-slate-500"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span>Trusted by 1,000+ candidates and recruiters</span>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white border-y border-slate-200"
      >
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-gradient">{value}</div>
              <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How it Works */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Hiring, <span className="text-gradient">reimagined</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Three steps from "unknown candidate" to "hired". No PDF screening. No wasted calls.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              className="card text-center group"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white mb-5 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <Icon className="w-7 h-7" />
              </div>
              <div className="text-5xl font-black text-slate-100 mb-3">0{i + 1}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Problem section */}
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold mb-6">
              Resumes are <span className="line-through opacity-60">dead</span> flat.
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
              A PDF can't show passion. Can't show communication skills. Can't show confidence.
              But a 60-second video can — and now AI can measure it.
            </p>
            <Link
              to="/register?role=candidate"
              className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-xl hover:bg-brand-50 transition-colors shadow-lg text-lg"
            >
              Record Your First Video
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              AI that explains <span className="text-gradient">why</span>, not just scores
            </h2>
            <div className="space-y-5">
              {[
                { icon: '🎯', title: 'Explainable Match Scores', desc: '87% — Strong in React & JavaScript. Missing: TypeScript, Docker.' },
                { icon: '🗣️', title: 'Communication Quality Score', desc: 'Rate clarity, confidence, pacing, and filler words from 1-10.' },
                { icon: '⚡', title: 'Real-time AI Analysis', desc: 'Gemini watches the video, transcribes speech, extracts skills instantly.' },
                { icon: '📋', title: 'Kanban Pipeline', desc: 'Drag candidates from Applied → Screened → Interview → Hired.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{title}</h4>
                    <p className="text-slate-500 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            {/* Mock candidate card */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold">A</div>
              <div>
                <div className="font-bold text-slate-900">Arjun Patel</div>
                <div className="text-sm text-slate-500">Full-Stack Developer</div>
              </div>
              <div className="ml-auto">
                <div className="w-14 h-14 relative">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#10b981" strokeWidth="5"
                      strokeDasharray={`${0.87 * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">87%</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-600 italic mb-3">
              "Strong full-stack developer with proven React and Node.js expertise. Missing TypeScript — trainable in 2 weeks."
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {['React ✓', 'Node.js ✓', 'MongoDB ✓'].map(s => (
                <span key={s} className="skill-matched text-xs">{s}</span>
              ))}
              {['TypeScript ✗', 'Docker ✗'].map(s => (
                <span key={s} className="skill-missing text-xs">{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Communication Score: <strong className="text-brand-600">8/10</strong> — Clear, confident, well-paced
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 font-extrabold text-xl mb-3">
            <Video className="w-5 h-5 text-brand-400" />
            <span>HireVision</span>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            AI-powered video hiring. Built with ❤️ using Gemini 2.5 Flash.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm text-slate-300">
            <Zap className="w-4 h-4 text-yellow-400" />
            Built with Gemini AI · text-embedding-004 · Firebase · MongoDB
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
