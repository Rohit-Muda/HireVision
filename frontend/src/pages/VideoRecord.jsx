import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Video, Square, RotateCcw, Zap, Mic, MicOff, Camera, Upload, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/ui/Button';

const ANALYSIS_STEPS = [
  { label: 'Uploading video...', duration: 2000 },
  { label: 'AI is watching your video...', duration: 15000 },
  { label: 'Extracting skills...', duration: 5000 },
  { label: 'Scoring communication...', duration: 3000 },
];

const VideoRecord = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [state, setState] = useState('idle'); // idle | recording | stopped | analyzing
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [timer, setTimer] = useState(0);
  const [permissionError, setPermissionError] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

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
          ? 'Camera/microphone access denied. Please allow permissions and refresh.'
          : 'Could not access camera. Please check your device.'
      );
    }
  }, []);

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initCamera]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    // Pick best supported codec
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: mimeType || undefined,
      videoBitsPerSecond: 2500000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoURL(url);
      // Switch video to playback
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
      }
      setState('stopped');
    };

    mediaRecorder.start(100);
    mediaRecorderRef.current = mediaRecorder;

    setState('recording');
    setTimer(0);

    // Timer
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t >= 59) {
          stopRecording();
          return 60;
        }
        return t + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    // NOTE: Do NOT stop the stream here — reRecord() needs it.
    // Stream is cleaned up by the useEffect return and reRecord().
  };

  const reRecord = async () => {
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoBlob(null);
    setVideoURL(null);
    setTimer(0);
    setCompletedSteps([]);
    setState('idle');
    await initCamera();
    if (videoRef.current) videoRef.current.src = '';
  };

  const analyzeVideo = async () => {
    if (!videoBlob) return;
    setState('analyzing');
    setAnalysisStep(0);
    setCompletedSteps([]);

    // Animate steps
    let stepIdx = 0;
    const advanceStep = () => {
      if (stepIdx < ANALYSIS_STEPS.length - 1) {
        setCompletedSteps((prev) => [...prev, stepIdx]);
        stepIdx++;
        setAnalysisStep(stepIdx);
        setTimeout(advanceStep, ANALYSIS_STEPS[stepIdx]?.duration || 3000);
      }
    };
    setTimeout(advanceStep, ANALYSIS_STEPS[0].duration);

    try {
      const formData = new FormData();
      // Use the actual blob type to determine filename/extension
      const ext = videoBlob.type.includes('mp4') ? 'mp4' : videoBlob.type.includes('mov') ? 'mov' : 'webm';
      formData.append('video', videoBlob, `resume.${ext}`);

      const res = await api.post('/candidates/analyze-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 min — Gemini File API processing can take time
      });

      setCompletedSteps([0, 1, 2, 3]);
      updateUser(res.data.user);
      toast.success('🎉 AI analysis complete!');

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setState('stopped');
      const msg = err.response?.data?.error || 'Analysis failed. Please try again.';
      toast.error(msg);
    }
  };

  // Upload from file fallback
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoBlob(file);
    setVideoURL(url);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
    }
    setState('stopped');
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-mesh pt-8 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Record Your <span className="text-gradient">Video Resume</span>
          </h1>
          <p className="text-slate-500">60 seconds to show who you really are. AI does the rest.</p>
        </motion.div>

        {/* Permission Error */}
        {permissionError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Camera Access Required</p>
              <p className="text-red-600 text-sm">{permissionError}</p>
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-brand-600 font-semibold cursor-pointer hover:underline">
                <Upload className="w-4 h-4" />
                Upload video instead
                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </motion.div>
        )}

        {/* Video area */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video mb-6">
          <video
            ref={videoRef}
            autoPlay
            muted={state !== 'stopped'}
            playsInline
            controls={state === 'stopped'}
            className="w-full h-full object-cover"
          />

          {/* Recording overlay */}
          {state === 'recording' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="rec-dot w-3 h-3 rounded-full bg-red-500" />
              <span className="text-white text-sm font-bold">REC</span>
              <span className="text-red-400 text-sm font-mono">{formatTime(timer)}</span>
            </div>
          )}

          {/* Timer bar */}
          {state === 'recording' && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-400 to-violet-400"
                initial={{ width: '0%' }}
                animate={{ width: `${(timer / 60) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}

          {/* Idle overlay */}
          {state === 'idle' && !permissionError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent">
              <motion.button
                onClick={startRecording}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ boxShadow: ['0 0 0 0 rgba(79,70,229,0.5)', '0 0 0 20px rgba(79,70,229,0)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-2xl"
              >
                <Video className="w-8 h-8 text-white" />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Analysis Loading Overlay */}
        <AnimatePresence>
          {state === 'analyzing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card mb-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                AI is analyzing your video...
              </h3>
              <div className="space-y-3">
                {ANALYSIS_STEPS.map((step, i) => {
                  const isCompleted = completedSteps.includes(i);
                  const isCurrent = analysisStep === i && !isCompleted;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: isCompleted || isCurrent ? 1 : 0.4 }}
                      className="flex items-center gap-3"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin text-brand-600 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-600 line-through' : isCurrent ? 'text-brand-700' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        {state !== 'analyzing' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-4">
            {state === 'idle' && (
              <>
                <Button onClick={startRecording} size="lg" className="gap-3" disabled={!!permissionError}>
                  <Video className="w-5 h-5" />
                  Start Recording
                </Button>
                {!permissionError && (
                  <label className="btn-secondary text-base px-6 py-4 gap-2 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </>
            )}

            {state === 'recording' && (
              <Button onClick={stopRecording} variant="danger" size="lg" className="gap-3">
                <Square className="w-5 h-5 fill-current" />
                Stop Recording ({formatTime(60 - timer)} left)
              </Button>
            )}

            {state === 'stopped' && (
              <>
                <Button onClick={reRecord} variant="secondary" size="lg" className="gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Re-record
                </Button>
                <Button onClick={analyzeVideo} size="lg" className="gap-3">
                  <Zap className="w-5 h-5" />
                  Analyze with AI
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Tips */}
        {state === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Mic, label: 'Speak clearly', hint: 'Stay 1-2 feet from mic' },
              { icon: Camera, label: 'Good lighting', hint: 'Face a window or lamp' },
              { icon: Video, label: '60 seconds max', hint: 'Concise and impactful' },
            ].map(({ icon: Icon, label, hint }) => (
              <div key={label} className="p-4 rounded-xl bg-white/60 border border-slate-100">
                <Icon className="w-6 h-6 text-brand-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{hint}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideoRecord;
