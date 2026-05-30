import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, Zap, Users, BarChart3, ChevronRight, Star, ArrowRight,
  CheckCircle, Briefcase, TrendingUp, Clock, Shield, Search,
  Play, MessageSquare, LayoutDashboard
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const Landing = () => {
  const candidateFeatures = [
    { icon: Video, title: 'Record Video Resume', desc: 'Record a 60-second intro straight from your browser. Show your personality, confidence, and skills beyond just text.' },
    { icon: Zap, title: 'Instant Analysis', desc: 'Our system listens, transcribes, extracts skills, and scores your communication quality in seconds.' },
    { icon: Briefcase, title: 'Smart Job Matching', desc: 'Get matched to jobs with an explainable score. Know exactly which skills you have and which you are missing.' },
    { icon: TrendingUp, title: 'Track Applications', desc: 'See exactly where you stand from Applied to Screened to Interview or Hired in real time.' },
  ];

  const recruiterFeatures = [
    { icon: Search, title: 'Ranked Candidates', desc: 'Candidates are ranked by skill overlap and communication score. See who fits best before the first call.' },
    { icon: LayoutDashboard, title: 'Kanban Pipeline', desc: 'Drag candidates through your hiring stages. Manage everything in one comprehensive board.' },
    { icon: Play, title: 'Watch Video Resumes', desc: 'Watch candidates present themselves. Hear their voice, see their confidence, and skip the traditional PDF screening.' },
    { icon: MessageSquare, title: 'Explainable Scores', desc: 'Every match score comes with a plain-English explanation of strengths and skill gaps.' },
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma', role: 'Software Engineer, Pune',
      text: 'I got shortlisted in 2 days after uploading my video resume. The summary described my skills perfectly.',
      avatar: 'R', color: 'bg-slate-800'
    },
    {
      name: 'Priya Menon', role: 'HR Manager, TechCorp Bangalore',
      text: 'We reviewed 30 candidates in an hour. The ranked list saved us days of resume screening.',
      avatar: 'P', color: 'bg-slate-800'
    },
    {
      name: 'Arjun Nair', role: 'Product Designer, Mumbai',
      text: 'The communication score helped me realize I was rambling. Re-recorded and got 8.5/10.',
      avatar: 'A', color: 'bg-slate-800'
    },
  ];

  const stats = [
    { value: '87%', label: 'Faster Screening', icon: Clock },
    { value: '3×', label: 'Better Match Quality', icon: TrendingUp },
    { value: '60s', label: 'All You Need', icon: Video },
    { value: '100%', label: 'Free to Start', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <div className="relative pt-20 pb-32 px-4 bg-white border-b border-slate-200">
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium mb-8"
          >
            <Zap className="w-4 h-4 text-slate-500" />
            Next-Generation Video Hiring
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-white text-xs font-medium ml-1">NEW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight"
          >
            Your Video.{' '}
            <span className="text-slate-600">Your Story.</span>
            <br />Your Next Job.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Automated video resumes that show who you really are, not just what is on paper.
            Candidates record, the system analyzes, and recruiters hire smarter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register?role=candidate" className="btn-primary text-lg px-8 py-3.5 gap-3">
              <Video className="w-5 h-5" />
              I am a Candidate
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register?role=recruiter" className="btn-secondary text-lg px-8 py-3.5 gap-3 bg-white">
              <Users className="w-5 h-5" />
              I am a Recruiter
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center justify-center gap-2 mt-10 text-sm text-slate-600"
          >
            <div className="flex -space-x-2">
              {['R','P','A','S','M'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium bg-slate-400">
                  {l}
                </div>
              ))}
            </div>
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-slate-400 text-slate-400" />)}
            </div>
            <span className="font-medium">Trusted by 1,000+ professionals</span>
          </motion.div>
        </div>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp} transition={{ duration: 0.5 }}
        className="bg-white border-b border-slate-200"
      >
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 mb-3">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-600 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-200 text-slate-800 text-sm font-medium mb-4">How it works</span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Hired in 3 steps
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            No PDF screening. No wasted calls. From unknown candidate to hired in under a minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Video, step: '01', title: 'Record Your Story', desc: 'Hit record. Talk about yourself for 60 seconds. Show your personality, not just your resume.' },
            { icon: Zap, step: '02', title: 'System Analyzes Everything', desc: 'The platform transcribes your speech, extracts skills, scores your communication, and builds your profile.' },
            { icon: Users, step: '03', title: 'Get Matched Instantly', desc: 'Your profile is matched to relevant jobs with explainable scores. One click to apply.' },
          ].map(({ icon: Icon, step, title, desc }, i) => (
            <motion.div
              key={title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
              className="card relative overflow-hidden bg-white"
            >
              <div className="absolute top-4 right-4 text-5xl font-bold text-slate-100 select-none">{step}</div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-slate-900 text-white mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FOR CANDIDATES ─────────────────────────────────────────────────── */}
      <div className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200 mb-4">For Candidates</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Stand out. Get hired faster.
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">Your skills deserve to be seen, not buried in a PDF.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {candidateFeatures.map(({ icon: Icon, title, desc }, i) => (
               <motion.div
                 key={title} {...fadeUp} transition={{ delay: i * 0.1 }}
                 className="card flex gap-4 bg-slate-50 border-transparent hover:border-slate-300 transition-colors"
               >
                 <div className="w-12 h-12 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                   <Icon className="w-6 h-6 text-slate-700" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                   <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/register?role=candidate" className="btn-primary text-base px-8 py-3.5 gap-2">
              <Video className="w-5 h-5" /> Start Recording Free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── FOR RECRUITERS ─────────────────────────────────────────────────── */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-200 text-slate-800 text-sm font-medium mb-4">For Recruiters</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-3">
              Hire smarter. Save hours.
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">The system does the heavy lifting. You make the human call.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {recruiterFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="card flex gap-4 bg-white border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/register?role=recruiter" className="btn-secondary text-base px-8 py-3.5 gap-2 bg-white">
              <Users className="w-5 h-5" /> Post Jobs & Find Talent
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── LIVE DEMO MOCK CARD ─────────────────────────────────────────────── */}
      <div className="bg-slate-900 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="text-white">
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Insights that explain why, not just scores
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <CheckCircle className="w-5 h-5 text-slate-400" />, t: 'Explainable Match Scores', d: '87% Strong in React & JavaScript. Missing: TypeScript, Docker.' },
                  { icon: <BarChart3 className="w-5 h-5 text-slate-400" />, t: 'Communication Quality', d: 'Rate clarity, confidence, pacing, and structure from 1-10.' },
                  { icon: <LayoutDashboard className="w-5 h-5 text-slate-400" />, t: 'Kanban Pipeline', d: 'Drag candidates from Applied to Screened to Interview to Hired.' },
                  { icon: <Zap className="w-5 h-5 text-slate-400" />, t: 'Instant Analysis', d: 'Skills extracted, profile built, and matched before you blink.' },
                ].map(({ icon, t, d }) => (
                  <div key={t} className="flex gap-4">
                    <div className="mt-1">{icon}</div>
                    <div>
                      <h4 className="font-semibold text-slate-100">{t}</h4>
                      <p className="text-slate-400 text-sm mt-1">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mock candidate card */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-medium text-lg">A</div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">Arjun Patel</div>
                  <div className="text-sm text-slate-500">Full-Stack Developer, Mumbai</div>
                </div>
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#0f172a" strokeWidth="4"
                      strokeDasharray={`${0.87 * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">87%</span>
                </div>
              </div>

              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 mb-4">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Executive Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">"Strong full-stack developer with 3 years React experience. Demonstrates excellent problem-solving and clear communication."</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {['React', 'Node.js', 'MongoDB'].map(s => (
                  <span key={s} className="skill-matched text-xs px-2.5 py-1">{s}</span>
                ))}
                {['TypeScript', 'Docker'].map(s => (
                  <span key={s} className="skill-missing text-xs px-2.5 py-1">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                  Communication: <strong className="text-slate-900">8/10</strong>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">Top Match</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-24 bg-slate-50">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            What people are saying
          </h2>
          <p className="text-slate-600">Real results from candidates and recruiters.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, avatar, color }, i) => (
            <motion.div
              key={name} {...fadeUp} transition={{ delay: i * 0.12 }}
              className="card bg-white"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-slate-300 text-slate-300" />)}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-medium text-sm`}>
                  {avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <motion.div
          {...fadeUp}
          className="card text-center py-16 bg-white border-slate-200"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Ready to transform your hiring?
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Join thousands of candidates and recruiters who have made the switch from PDFs to video.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=candidate" className="btn-primary px-8 py-3.5 gap-2">
              <Video className="w-5 h-5" /> Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3.5 gap-2 bg-white">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              HireVision
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
              <Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-slate-900 transition-colors">Register</Link>
              <Link to="/jobs" className="hover:text-slate-900 transition-colors">Browse Jobs</Link>
            </div>
            <p className="text-slate-500 text-sm">© 2025 HireVision. Professional video hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
