import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { FiUploadCloud, FiCpu, FiActivity, FiImage } from 'react-icons/fi';
import { toImg } from '../utils/toImg';

// Local sample images (place files under: client/src/assets/samples/)
import leaf1 from '../assets/tamatoleaf.png';
import leaf2 from '../assets/riceleaf.png';
import leaf3 from '../assets/grapesleaf.png';
import CropGuard from '../assets/CropGuard AI.jpg';

const SCANS_KEY = 'cg:scans';
const FEEDBACKS_KEY = 'cg:feedbacks';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('No file chosen');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [recent, setRecent] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.title;
    document.title = 'CropGuard AI | Leaf Disease Detection';
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(SCANS_KEY) || '[]');
      if (Array.isArray(arr)) setRecent(arr);
    } catch (e) {
      console.warn('Failed to load recent scans from localStorage:', e);
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onFilePicked = (picked) => {
    setFile(picked || null);
    setFileName(picked ? picked.name : 'No file chosen');
    setStatus('');
    setProgress(0);
  };

  const onFileChange = (e) => onFilePicked(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onFilePicked(f);
  };

  const handleChooseFile = () => inputRef.current?.click();

  // Local-only samples (no external links)
  const SAMPLE_IMAGES = [
    { label: 'Tomato Leaf', src: leaf1 },
    { label: 'Rice Leaf', src: leaf2 },
    { label: 'Grape Leaf', src: leaf3 },
  ];

  const loadSample = async (srcUrl, label) => {
    setStatus('');
    setProgress(0);
    try {
      // Imported image resolves to a local URL served by Vite
      const res = await fetch(srcUrl);
      const blob = await res.blob();
      const ext = blob.type?.includes('png') ? 'png' : 'jpg';
      const f = new File(
        [blob],
        `${label.replace(/\s+/g, '_').toLowerCase()}.${ext}`,
        { type: blob.type || 'image/jpeg' }
      );
      onFilePicked(f);
      setStatus('Sample image loaded.');
    } catch {
      setStatus('Failed to load sample image. Please try another.');
    }
  };

  const fileToDataURL = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const saveRecent = (entry) => {
    try {
      const arr = JSON.parse(localStorage.getItem(SCANS_KEY) || '[]');
      const next = [entry, ...arr].slice(0, 12);
      localStorage.setItem(SCANS_KEY, JSON.stringify(next));
      setRecent(next);
    } catch {
      console.warn('Failed to save recent scans locally');
    }
  };

  const clearRecent = () => {
    localStorage.removeItem(SCANS_KEY);
    setRecent([]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!file) return setStatus('Please choose an image first.');

    const formData = new FormData();
    formData.append('file', file);
    const API = import.meta.env.VITE_API_URL || '';
    const url = `${API}/predict`;

    try {
      setUploading(true);
      setProgress(10);
      const timer = setInterval(() => setProgress((p) => (p < 90 ? p + 10 : p)), 250);

      const res = await fetch(url, { method: 'POST', body: formData });
      clearInterval(timer);
      setProgress(100);

      const ct = res.headers.get('content-type') || '';
      const payload = ct.includes('application/json') ? await res.json() : await res.text();

      if (!res.ok) {
        const msg = (typeof payload === 'string' ? payload : payload?.error) || 'Prediction failed.';
        throw new Error(msg);
      }

      const data = payload;
      const resultLabel = data.result || data.prediction || 'Unknown';
      const histImage = data.image_url || (await fileToDataURL(file));

      saveRecent({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: Date.now(),
        imageUrl: histImage,
        result: resultLabel,
        confidence: data.confidence ?? null,
      });

      navigate('/result', {
        replace: true,
        state: {
          result: resultLabel,
          confidence: data.confidence,
          imageUrl: data.image_url || preview,
          probs: data.probs,
          raw: data,
        },
      });
    } catch (err) {
      setStatus(err.message || 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  const openRecent = (scan) => {
    navigate('/result', {
      replace: false,
      state: {
        result: scan.result,
        confidence: scan.confidence,
        imageUrl: scan.imageUrl,
        probs: null,
        raw: { cached: true },
      },
    });
  };

  const fmtPct = (c) => (c == null ? '-' : `${Math.round(Number(c) * 100)}%`);

  const submitReview = (e) => {
    e?.preventDefault?.();
    setReviewMsg('');
    const text = reviewText.trim();
    if (!text) {
      setReviewMsg('Please write a message before sending.');
      return;
    }
    try {
      const arr = JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
      const entry = { id: `${Date.now()}`, at: Date.now(), message: text };
      const next = [entry, ...arr].slice(0, 50);
      localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(next));
      setReviewText('');
      setReviewMsg('Thanks! Your feedback has been sent.');
    } catch {
      setReviewMsg('Failed to save feedback locally. Please try again.');
    }
  };

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            New • AI-powered
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mt-3">CropGuard AI</h2>
          <p className="text-gray-700 mt-4 max-w-2xl mx-auto text-lg">
            Upload a plant leaf photo and let AI flag likely diseases and stress. Designed for growers of
            fruits, vegetables, and grains to make faster, informed decisions.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xl">
              <FiUploadCloud />
            </div>
            <div>
              <div className="font-semibold text-lg">1) Upload or drag & drop</div>
              <p className="text-sm text-gray-600 mt-1">Use a clear, well-lit leaf image. One leaf, sharp focus works best.</p>
            </div>
          </div>
          <div className="card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xl">
              <FiCpu />
            </div>
            <div>
              <div className="font-semibold text-lg">2) AI analysis</div>
              <p className="text-sm text-gray-600 mt-1">Analyzes patterns, textures, and color signals in seconds.</p>
            </div>
          </div>
          <div className="card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xl">
              <FiActivity />
            </div>
            <div>
              <div className="font-semibold text-lg">3) Diagnosis & confidence</div>
              <p className="text-sm text-gray-600 mt-1">See predicted class and confidence, then act with confidence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 60/40 layout (3/5 and 2/5), equal visual height, no scrollbars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* Left (60%) */}
        <form
          onSubmit={onSubmit}
          className="lg:col-span-3 card p-8 h-full min-h-[720px] flex flex-col"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold">Analyze a Leaf</h3>
            <span className="text-xs text-gray-500">JPEG/PNG up to ~10MB</span>
          </div>

          <div
            className={`mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition
            ${isDragging ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-600'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            onClick={handleChooseFile}
            role="button"
            tabIndex={0}
          >
            {preview ? (
              <div className="flex flex-col items-center">
                <div className="img-wrap w-full max-w-2xl h-72">
                  <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
                </div>
                <p className="mt-3 text-sm text-gray-700">{fileName}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-600">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
                  <FiImage className="text-xl" />
                </div>
                <p className="mt-3 font-medium text-gray-800 text-lg">Drag & drop an image here</p>
                <p className="text-sm">or click to browse</p>
              </div>
            )}
            <input
              id="file-upload"
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={handleChooseFile}>Choose Image</Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? 'Detecting…' : 'Detect Disease'}
            </Button>
          </div>

          {/* Progress + status */}
          <div className={`mt-4 h-2 w-full bg-gray-200 rounded overflow-hidden ${progress ? '' : 'opacity-0'}`}>
            <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {status && <div className="mt-3 text-sm text-red-600">{status}</div>}

          {/* Recent Scans */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Recent Scans</h4>
              {recent.length > 0 && (
                <button type="button" className="text-sm text-red-600 hover:underline" onClick={clearRecent}>
                  Clear
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-600 mt-2">No scans yet. Upload an image to see history here.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recent.map((scan) => (
                  <button
                    key={scan.id}
                    type="button"
                    className="group relative card p-0 overflow-hidden text-left"
                    onClick={() => openRecent(scan)}
                    title={`Open result: ${scan.result}`}
                  >
                    <img
                      src={toImg(scan.imageUrl)}
                      alt={scan.result}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      loading="lazy"
                    />
                    <div className="p-2">
                      <div className="text-xs font-semibold line-clamp-1">{scan.result}</div>
                      <div className="text-[11px] text-gray-600 flex items-center justify-between mt-0.5">
                        <span>{new Date(scan.at).toLocaleString()}</span>
                        <span className="ml-2">{fmtPct(scan.confidence)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Right (40%) */}
        <div className="lg:col-span-2 card p-8 h-full min-h-[720px] flex flex-col">
          {/* Decorative banner to balance visual height */}
          <div className="card-muted overflow-hidden">
            <img
              src={CropGuard} // local image to keep everything on repo
              alt="Leaf banner"
              className="w-full h-48 md:h-56 object-cover"
              loading="lazy"
            />
          </div>

          <div className="mt-8 flex-1 flex flex-col space-y-8">
            {/* Samples */}
            <div>
              <h4 className="text-xl font-semibold">Try Sample Images</h4>
              <p className="text-sm text-gray-600 mt-1">Click a sample below to test the pipeline instantly.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {SAMPLE_IMAGES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="group relative aspect-square card p-0 overflow-hidden"
                    onClick={() => loadSample(s.src, s.label)}
                    title={`Use ${s.label}`}
                  >
                    <img
                      src={s.src}
                      alt={s.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1 right-1 text-[11px] bg-black/50 text-white rounded px-1 py-0.5">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h4 className="text-xl font-semibold">Accuracy Tips</h4>
              <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>Capture a single leaf in clear focus, good lighting.</li>
                <li>Avoid heavy shadows or busy backgrounds.</li>
                <li>Fill most of the frame with the leaf area.</li>
                <li>Wipe dust/water for consistent color and texture.</li>
              </ul>
            </div>

            {/* Feedback */}
            <div className="mt-auto">
              <h4 className="text-xl font-semibold">Share Your Feedback</h4>
              <form className="mt-3 space-y-3" onSubmit={submitReview}>
                <textarea
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full input-outline rounded-xl"
                  placeholder="Your message…"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Help us improve CropGuard AI</span>
                  <Button type="submit">Send</Button>
                </div>
                {reviewMsg && (
                  <div className={`text-sm ${reviewMsg.startsWith('Thanks') ? 'text-green-700' : 'text-red-600'}`}>
                    {reviewMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}