import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Video, Square, RotateCcw, Zap, Upload, CheckCircle, Loader2, AlertCircle, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ─── Analysis steps ───────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Uploading your video...', icon: '☁️' },
  { label: 'AI analyzing your speech...', icon: '🧠' },
  { label: 'Extracting skills & experience...', icon: '⚡' },
  { label: 'Scoring communication quality...', icon: '📊' },
  { label: 'Building your profile embedding...', icon: '🔗' },
];

// ─── Circular countdown ring ──────────────────────────────────────────────────
const TimerRing = ({ elapsed, max = 60 }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(elapsed / max, 1);
  const remaining = max - elapsed;
  const isWarning = remaining <= 10;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        {/* Progress */}
        <motion.circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke={isWarning ? '#ef4444' : '#818cf8'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${pct * circ} ${circ}`}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className={`text-4xl font-black tabular-nums ${isWarning ? 'text-red-400' : 'text-white'}`}>
          {String(remaining).padStart(2, '0')}
        </span>
        <span className="text-xs text-white/50 font-medium">seconds left</span>
      </div>
    </div>
  );
};

// ─── Animated waveform (decorative) ──────────────────────────────────────────
const Waveform = () => (
  <div className="flex items-center gap-0.5 h-6">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-brand-400 rounded-full"
        animate={{ height: ['4px', `${8 + Math.sin(i * 0.8) * 12}px`, '4px'] }}
        transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.07 }}
      />
    ))}
  </div>
);

// ─── Upload progress bar ──────────────────────────────────────────────────────
const UploadProgress = ({ progress }) => (
  <div className="w-full">
    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
      <span>Uploading to Gemini AI...</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const VideoRecord = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const elapsedRef = useRef(0); // avoid closure stale state

  const [phase, setPhase] = useState('idle'); // idle|recording|preview|analyzing|done
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [permissionError, setPermissionError] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Web Speech API for real-time transcript ─────────────────────────────────
  const speechRecRef = useRef(null);
  const transcriptRef = useRef(''); // accumulated transcript (avoids stale closure)
  const [liveTranscript, setLiveTranscript] = useState('');
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // ── Camera init ─────────────────────────────────────────────────────────────
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setPermissionError(
        err.name === 'NotAllowedError'
          ? 'Camera or microphone access was denied. Please allow permissions in your browser and refresh.'
          : 'Could not access your camera. Please check that no other app is using it.'
      );
    }
  }, []);

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [initCamera]);

  // ── Recording ───────────────────────────────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    elapsedRef.current = 0;

    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';

    const mr = new MediaRecorder(streamRef.current, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: 2_500_000,
    });

    mr.ondataavailable = e => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoURL(url);
      if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.src = url; }
      setPhase('preview');
    };

    mr.start(100);
    mediaRecorderRef.current = mr;
    setElapsed(0);
    setLiveTranscript('');
    transcriptRef.current = '';
    setPhase('recording');

    // ── Start speech recognition alongside recording ────────────────────────
    if (speechSupported) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalText = '';
          let interimText = '';
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript + ' ';
            } else {
              interimText += result[0].transcript;
            }
          }
          transcriptRef.current = finalText.trim();
          setLiveTranscript((finalText + interimText).trim());
        };

        recognition.onerror = (e) => {
          console.warn('SpeechRecognition error:', e.error);
          // Non-fatal — we still have the video as fallback
        };

        recognition.start();
        speechRecRef.current = recognition;
        console.log('🎙️ Speech recognition started');
      } catch (e) {
        console.warn('Could not start speech recognition:', e);
      }
    }

    timerIntervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= 60) {
        clearInterval(timerIntervalRef.current);
        if (mediaRecorderRef.current?.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        // Stop speech recognition when time is up
        if (speechRecRef.current) {
          try { speechRecRef.current.stop(); } catch (_) {}
        }
      }
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    // Stop speech recognition
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (_) {}
      console.log('🎙️ Speech recognition stopped. Transcript:', transcriptRef.current.length, 'chars');
    }
    // Don't stop stream here — reRecord() needs it
  };

  const reRecord = async () => {
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoBlob(null);
    setVideoURL(null);
    setElapsed(0);
    setCompletedSteps([]);
    setUploadProgress(0);
    setLiveTranscript('');
    transcriptRef.current = '';
    setPhase('idle');
    if (videoRef.current) videoRef.current.src = '';
    await initCamera();
  };

  // ── AI Analysis ─────────────────────────────────────────────────────────────
  const submitForAnalysis = async () => {
    if (!videoBlob) return;
    setPhase('analyzing');
    setAnalysisStep(0);
    setCompletedSteps([]);
    setUploadProgress(0);

    // Animate steps sequentially (decorative)
    const stepTimings = [0, 3000, 8000, 14000, 20000];
    stepTimings.forEach((delay, i) => {
      if (i === 0) return;
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, i - 1]);
        setAnalysisStep(i);
      }, delay);
    });

    try {
      // ── Determine MIME type explicitly (MediaRecorder may produce empty type) ──
      // If blob type is empty string, browsers send it as text/plain via FormData.
      // Force an explicit MIME type to ensure multer accepts it.
      const blobMime = videoBlob.type && videoBlob.type !== ''
        ? videoBlob.type
        : 'video/webm';
      const ext = blobMime.includes('mp4') ? 'mp4' : blobMime.includes('mov') ? 'mov' : 'webm';

      // Create a typed blob so FormData sends the correct Content-Type part header
      const typedBlob = blobMime === videoBlob.type
        ? videoBlob
        : new Blob([videoBlob], { type: blobMime });

      const formData = new FormData();
      formData.append('video', typedBlob, `resume.${ext}`);

      // ✅ Attach browser transcript — backend uses text-only analysis (100x cheaper)
      const capturedTranscript = transcriptRef.current.trim();
      if (capturedTranscript) {
        formData.append('transcript', capturedTranscript);
        console.log('📝 Sending browser transcript:', capturedTranscript.length, 'chars');
      } else {
        console.log('⚠️ No browser transcript — backend will use full video analysis');
      }

      const res = await api.post('/candidates/analyze-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300_000,
        onUploadProgress: e => {
          if (e.total) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      setCompletedSteps([0, 1, 2, 3, 4]);
      setAnalysisStep(5);
      setPhase('done');
      updateUser(res.data.user);
      toast.success('🎉 AI analysis complete! Your profile is live.');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setPhase('preview');
      const msg = err.response?.data?.error || 'Analysis failed. Please try again.';
      toast.error(msg);
    }
  };

  // ── File upload fallback ─────────────────────────────────────────────────────
  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoBlob(file);
    setVideoURL(url);
    if (videoRef.current) { videoRef.current.srcObject = null; videoRef.current.src = url; }
    setPhase('preview');
    toast.success('Video loaded! Click "Analyze with AI" to continue.');
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 pt-8 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Record Your{' '}
            <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              Video Resume
            </span>
          </h1>
          <p className="text-slate-400">60 seconds. AI does the rest — skills, scores, job matches.</p>
          {speechSupported && (
            <p className="text-xs text-emerald-400/60 mt-1">🎙️ Live speech capture enabled — ultra-fast analysis</p>
          )}
        </motion.div>

        {/* Permission Error */}
        <AnimatePresence>
          {permissionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Camera Access Required</p>
                <p className="text-red-400/80 text-sm mt-0.5">{permissionError}</p>
                <label className="mt-3 inline-flex items-center gap-2 text-sm text-brand-400 font-semibold cursor-pointer hover:text-brand-300 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload a video file instead
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── VIDEO VIEWPORT ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl aspect-video mb-6 border border-white/5"
          style={{ boxShadow: phase === 'recording' ? '0 0 60px rgba(99,102,241,0.3)' : undefined }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted={phase !== 'preview'}
            playsInline
            controls={phase === 'preview'}
            className="w-full h-full object-cover"
          />

          {/* ── IDLE OVERLAY ─────────────────────────────────────────────────── */}
          {phase === 'idle' && !permissionError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/60 to-transparent">
              <motion.button
                onClick={startRecording}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-2xl"
              >
                {/* Pulse rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-brand-400/50"
                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.8, 0, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-violet-400/30"
                  animate={{ scale: [1, 1.7, 1.7], opacity: [0.5, 0, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                />
                <Video className="w-10 h-10 text-white" />
              </motion.button>
              <p className="mt-4 text-white/70 text-sm font-medium">Click to start recording</p>
            </div>
          )}

          {/* ── RECORDING OVERLAY ────────────────────────────────────────────── */}
          {phase === 'recording' && (
            <>
              {/* REC badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="rec-dot w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-white text-xs font-bold tracking-wider">REC</span>
              </div>

              {/* Waveform indicator */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-green-400" />
                <Waveform />
              </div>

              {/* Center countdown ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <TimerRing elapsed={elapsed} max={60} />
              </div>

              {/* Bottom progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-violet-500"
                  animate={{ width: `${(elapsed / 60) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Live transcript preview */}
              {liveTranscript && (
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 max-h-16 overflow-hidden">
                    <p className="text-white/80 text-xs leading-relaxed truncate">
                      🎙️ {liveTranscript.slice(-120)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ANALYZING OVERLAY ────────────────────────────────────────────── */}
          {(phase === 'analyzing' || phase === 'done') && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center px-6">
                <motion.div
                  animate={{ rotate: phase === 'done' ? 0 : 360 }}
                  transition={{ duration: 2, repeat: phase === 'done' ? 0 : Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  {phase === 'done'
                    ? <CheckCircle className="w-8 h-8 text-white" />
                    : <Zap className="w-8 h-8 text-white" />
                  }
                </motion.div>
                <p className="text-white font-bold text-lg mb-1">
                  {phase === 'done' ? 'Analysis Complete!' : 'AI is analyzing your video...'}
                </p>
                <p className="text-slate-400 text-sm">
                  {phase === 'done' ? 'Redirecting to your profile...' : 'This takes 30-90 seconds'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── ANALYSIS PROGRESS PANEL ──────────────────────────────────────── */}
        <AnimatePresence>
          {(phase === 'analyzing' || phase === 'done') && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6"
            >
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Loader2 className={`w-4 h-4 ${phase === 'done' ? 'text-emerald-400' : 'animate-spin text-brand-400'}`} />
                {phase === 'done' ? 'All Done!' : 'Processing...'}
              </h3>

              {/* Upload progress bar */}
              {uploadProgress < 100 && phase === 'analyzing' && (
                <div className="mb-4">
                  <UploadProgress progress={uploadProgress} />
                </div>
              )}

              <div className="space-y-3">
                {STEPS.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isCurrent = analysisStep === i && !isDone;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: isDone || isCurrent ? 1 : 0.35 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm">
                        {isDone
                          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                          : isCurrent
                            ? <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                            : <span className="text-slate-600 text-xs">{step.icon}</span>
                        }
                      </div>
                      <span className={`text-sm font-medium ${isDone ? 'text-emerald-400 line-through' : isCurrent ? 'text-white' : 'text-slate-600'}`}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CONTROLS ─────────────────────────────────────────────────────── */}
        {phase !== 'analyzing' && phase !== 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {/* IDLE */}
            {phase === 'idle' && (
              <>
                <button
                  onClick={startRecording}
                  disabled={!!permissionError}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-brand-500/25 hover:scale-105 active:scale-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Video className="w-5 h-5" />
                  Start Recording
                </button>
                {!permissionError && (
                  <label className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/10 text-slate-300 font-bold text-lg hover:border-brand-500/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </>
            )}

            {/* RECORDING */}
            {phase === 'recording' && (
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-600 text-white font-bold text-lg hover:bg-red-700 hover:scale-105 active:scale-100 transition-all duration-200"
              >
                <Square className="w-5 h-5 fill-current" />
                Stop Recording
              </button>
            )}

            {/* PREVIEW */}
            {phase === 'preview' && (
              <>
                <button
                  onClick={reRecord}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-white/10 text-slate-300 font-bold hover:border-white/20 hover:text-white transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Re-record
                </button>
                <button
                  onClick={submitForAnalysis}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-brand-500/25 hover:scale-105 active:scale-100 transition-all duration-200"
                >
                  <Zap className="w-5 h-5" />
                  Analyze with AI
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── TIPS ──────────────────────────────────────────────────────────── */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-3 gap-3 text-center"
          >
            {[
              { emoji: '🎤', label: 'Speak clearly', hint: 'Stay 1-2 feet from mic' },
              { emoji: '💡', label: 'Good lighting', hint: 'Face a window or lamp' },
              { emoji: '⏱️', label: 'Under 60 seconds', hint: 'Concise wins every time' },
            ].map(({ emoji, label, hint }) => (
              <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-2xl">{emoji}</span>
                <p className="text-sm font-semibold text-white mt-2">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
              </div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default VideoRecord;
