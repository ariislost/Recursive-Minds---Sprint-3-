import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { Item, AppUser } from '../types';
import { extractWarrantyFromOCR, calculateExpiryDate } from '../utils/ocrExtraction';
import { SAMPLE_BILLS, createReceiptCanvasDataUrl, SampleBill } from '../utils/sampleReceipts';
import { 
  Camera, 
  Upload as UploadIcon, 
  FileText, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon,
  Receipt,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RefreshCw,
  VideoOff
} from 'lucide-react';

interface UploadScreenProps {
  currentUser: AppUser | null;
  onSaveItem: (item: Omit<Item, 'id' | 'created_at'>) => Promise<void>;
  onSuccessNavigate: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  currentUser,
  onSaveItem,
  onSuccessNavigate,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'file'>('file');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [showRawText, setShowRawText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Camera state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Editable form fields
  const [product, setProduct] = useState('');
  const [brand, setBrand] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(12);
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('INR');
  const [hasExtracted, setHasExtracted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
  }, []);

  // Request & Start Camera
  const startCamera = useCallback(async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    setIsCameraStarting(true);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera hardware or WebRTC API is not supported in this browser. Please use the file upload option.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((playErr) => {
          console.warn('Video playback warning:', playErr);
        });
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      let errorString = 'Unable to access camera. Please use file upload instead.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorString = 'Camera access permission was denied. Please allow camera access in browser site permissions or use the file upload tab.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorString = 'No camera device found on this system. Please use file upload.';
      } else if (err.message) {
        errorString = err.message;
      }
      setCameraError(errorString);
    } finally {
      setIsCameraStarting(false);
    }
  }, [facingMode, stopCamera]);

  // Flip camera mode
  const handleToggleFacingMode = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    await startCamera(nextMode);
  };

  // Stop camera when unmounting or switching to 'file' mode
  useEffect(() => {
    if (activeMode === 'camera' && !selectedImage) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeMode, selectedImage, startCamera, stopCamera, facingMode]);

  // Handle OCR recognition on any data URL image
  const runOcrRecognition = async (imageDataUrl: string) => {
    setIsScanning(true);
    setScanProgress(5);
    setScanStatus('Initializing OCR worker...');
    setErrorMsg('');

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            setScanProgress(progress);
            setScanStatus(`Reading receipt data... ${progress}%`);
          } else {
            setScanStatus(`${m.status}...`);
          }
        },
      });

      setScanStatus('Running local text extraction...');
      const { data: { text } } = await worker.recognize(imageDataUrl);
      await worker.terminate();

      setRawOcrText(text);

      // Perform pure Regex extraction
      const extracted = extractWarrantyFromOCR(text);
      
      setProduct(extracted.product);
      setBrand(extracted.brand);
      setPurchaseDate(extracted.purchase_date);
      setWarrantyMonths(extracted.warranty_months);
      setPrice(extracted.price ? extracted.price.toString() : '');
      setCurrency(extracted.currency);
      setHasExtracted(true);
      setScanProgress(100);
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMsg(`OCR extraction error: ${err.message || 'Failed to parse image'}`);
    } finally {
      setIsScanning(false);
    }
  };

  // Capture frame from live video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current video frame to off-screen canvas
    ctx.drawImage(video, 0, 0, width, height);
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Stop camera and set captured snapshot
    stopCamera();
    setSelectedImage(capturedDataUrl);
    setImageFileName(`Captured_Bill_${new Date().toISOString().slice(0, 10)}.jpg`);
    setHasExtracted(false);

    // Automatically trigger OCR scanning on the captured photo
    runOcrRecognition(capturedDataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select an image file (PNG, JPG, WebP).');
        return;
      }
      setErrorMsg('');
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSelectedImage(dataUrl);
          setHasExtracted(false);
          runOcrRecognition(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setErrorMsg('');
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSelectedImage(dataUrl);
          setHasExtracted(false);
          runOcrRecognition(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: SampleBill) => {
    stopCamera();
    const dataUrl = createReceiptCanvasDataUrl(sample);
    setSelectedImage(dataUrl);
    setImageFileName(`${sample.brand}_${sample.product}_Invoice.png`);
    setHasExtracted(false);
    setErrorMsg('');
    runOcrRecognition(dataUrl);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageFileName('');
    setHasExtracted(false);
    setRawOcrText('');
    if (activeMode === 'camera') {
      startCamera(facingMode);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('You must be logged in to save warranties.');
      return;
    }
    if (!product.trim()) {
      setErrorMsg('Product name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveItem({
        user_id: currentUser.id,
        product: product.trim(),
        brand: brand.trim() || 'Generic',
        purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        warranty_months: Number(warrantyMonths) || 12,
        price: parseFloat(price) || 0,
        currency: currency || 'INR',
      });
      onSuccessNavigate();
    } catch (err: any) {
      setErrorMsg(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const calculatedExpiry = purchaseDate 
    ? calculateExpiryDate(purchaseDate, Number(warrantyMonths) || 12) 
    : '';

  return (
    <div className="w-full space-y-6">
      {/* Top Glassmorphic Banner */}
      <section className="glass-panel text-white rounded-[28px] p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></div>
          <span className="text-xs uppercase tracking-widest font-semibold text-white/70">
            Local OCR Engine
          </span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">
            Scan Receipt & Protect Warranty
          </h1>
          <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl leading-relaxed font-light">
            Capture a live receipt photo with your camera or upload any invoice image. Tesseract.js recognizes text locally in your browser with zero external AI API calls.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-2.5">
            Or test with a sample invoice:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_BILLS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                id={`sample-btn-${sample.id}`}
                onClick={() => handleSelectSample(sample)}
                className="text-xs py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Upload / Live Camera Extractor Section */}
      <section className="glass-panel border border-white/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-2xl">
        {errorMsg && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-[14px] text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Toggle Bar: "Take Photo" vs "Upload File" */}
        <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 max-w-sm mx-auto">
          <button
            type="button"
            id="toggle-mode-camera"
            onClick={() => {
              setActiveMode('camera');
              if (!selectedImage) {
                startCamera(facingMode);
              }
            }}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-white text-[#081018] shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Take Photo</span>
          </button>

          <button
            type="button"
            id="toggle-mode-file"
            onClick={() => {
              setActiveMode('file');
              stopCamera();
            }}
            className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'file'
                ? 'bg-white text-[#081018] shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadIcon className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Selected / Frozen Snapshot View */}
        {selectedImage ? (
          <div className="space-y-4 border border-white/15 rounded-[22px] p-5 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                  {imageFileName || 'Captured Receipt Snapshot'}
                </span>
              </div>
              <button
                type="button"
                id="clear-captured-image-btn"
                onClick={handleClearImage}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{activeMode === 'camera' ? 'Retake Photo' : 'Choose Another File'}</span>
              </button>
            </div>

            {/* Preview Container */}
            <div className="max-h-72 rounded-[16px] overflow-hidden border border-white/10 bg-[#081018]/90 flex items-center justify-center p-3">
              <img
                src={selectedImage}
                alt="Receipt Preview"
                className="max-h-68 w-auto object-contain rounded-[10px]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Scan Trigger / Re-Scan Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                id="scan-receipt-cta-btn"
                onClick={() => runOcrRecognition(selectedImage)}
                disabled={isScanning}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-full bg-white hover:bg-white/90 text-[#081018] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-99 shadow-lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#081018]" />
                    <span>{scanStatus || 'Processing OCR...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#081018]" />
                    <span>{hasExtracted ? 'Re-scan with Tesseract OCR' : 'Scan Receipt with Tesseract.js'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClearImage}
                className="py-3 px-5 rounded-full border border-white/15 text-xs font-semibold text-white/70 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Live Scan Progress */}
            {isScanning && (
              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent-gradient h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-white/60">
                  <span>{scanStatus}</span>
                  <span>{scanProgress}%</span>
                </div>
              </div>
            )}
          </div>
        ) : activeMode === 'camera' ? (
          /* Live Camera Stream View */
          <div className="space-y-4">
            {cameraError ? (
              <div className="border border-white/15 rounded-[22px] p-8 text-center bg-white/5 space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
                  <VideoOff className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-sm font-bold text-white">Camera Unavailable</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    {cameraError}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="py-2.5 px-5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('file')}
                    className="py-2.5 px-5 rounded-full bg-white text-[#081018] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <UploadIcon className="w-3.5 h-3.5" />
                    <span>Switch to File Upload</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-[22px] overflow-hidden border border-white/20 bg-black/80 aspect-[4/3] sm:aspect-[16/9] max-h-[440px] flex items-center justify-center shadow-2xl">
                {/* Live Video Element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Starting Camera Spinner */}
                {isCameraStarting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#081018]/80 backdrop-blur-sm z-20 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
                    <span className="text-xs text-white/80 font-medium">Opening Camera Feed...</span>
                  </div>
                )}

                {/* Framing Receipt Guide Lines */}
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/30 rounded-[16px] pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-white/50">
                    <span>RECEIPT BOUNDS</span>
                    <span>ALIGN INVOICE</span>
                  </div>
                  <div className="text-center text-[10px] text-white/40 tracking-wider">
                    Position receipt clearly in frame with good lighting
                  </div>
                </div>

                {/* Camera Control Overlays */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    id="switch-camera-btn"
                    onClick={handleToggleFacingMode}
                    className="p-2.5 rounded-full bg-[#081018]/70 hover:bg-[#081018]/90 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer active:scale-90"
                    title={`Switch Camera (${facingMode === 'environment' ? 'Back' : 'Front'})`}
                  >
                    <RotateCcw className="w-4 h-4 text-[var(--color-accent)]" />
                  </button>
                </div>

                {/* Shutter Capture Button at Bottom Center */}
                <div className="absolute bottom-5 inset-x-0 flex items-center justify-center z-20">
                  <button
                    type="button"
                    id="capture-photo-btn"
                    onClick={handleCapturePhoto}
                    disabled={isCameraStarting}
                    className="group relative flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                    title="Capture Photo"
                  >
                    {/* Outer glowing ring */}
                    <div className="w-18 h-18 rounded-full border-4 border-white/80 flex items-center justify-center bg-white/20 backdrop-blur-md shadow-2xl group-hover:border-white group-hover:scale-105 transition-all">
                      {/* Inner solid shutter disc */}
                      <div className="w-13 h-13 rounded-full bg-accent hover:opacity-90 flex items-center justify-center shadow-lg transition-colors">
                        <Camera className="w-6 h-6 text-[#081018] stroke-[2.5]" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Standard File Dropzone View */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-[var(--color-accent-border)] rounded-[22px] p-8 transition-all bg-white/5 cursor-pointer text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="receipt-file-input"
            />

            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white/10 text-[var(--color-accent)] flex items-center justify-center shadow-md border border-white/10">
                <UploadIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Tap to upload or drag & drop receipt file
                </p>
                <p className="text-xs text-white/50 mt-1 font-light">
                  Supports PNG, JPG, JPEG, WebP receipts and tax invoices
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Raw OCR Collapsible */}
        {rawOcrText && (
          <div className="border border-white/10 rounded-[18px] overflow-hidden bg-white/5">
            <button
              type="button"
              id="toggle-ocr-text-btn"
              onClick={() => setShowRawText(!showRawText)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--color-accent)]" />
                <span>View Extracted Raw OCR Text ({rawOcrText.length} characters)</span>
              </div>
              {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRawText && (
              <div className="p-4 border-t border-white/10 bg-[#081018]/80 max-h-48 overflow-y-auto">
                <pre className="text-[11px] font-mono text-white/80 whitespace-pre-wrap">
                  {rawOcrText}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Pre-filled Editable Form before saving */}
        {(hasExtracted || selectedImage) && (
          <form onSubmit={handleSave} className="space-y-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Verify & Save Warranty Details
                </h2>
                <p className="text-xs text-white/60">
                  Pre-filled via regex extraction. You can adjust any field before storing.
                </p>
              </div>
              {hasExtracted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  <span>OCR Extracted</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Product / Item Name *
                </label>
                <input
                  id="form-product-name"
                  type="text"
                  required
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="e.g. 55-inch OLED TV"
                  className="w-full glass-input rounded-[12px] p-3 text-sm"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Brand / Manufacturer
                </label>
                <input
                  id="form-brand-name"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Samsung, Apple, LG"
                  className="w-full glass-input rounded-[12px] p-3 text-sm"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Purchase Date
                </label>
                <input
                  id="form-purchase-date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full glass-input rounded-[12px] p-3 text-sm"
                />
              </div>

              {/* Warranty Duration (Months) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Warranty Duration (Months)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="form-warranty-months"
                    type="number"
                    min="1"
                    max="120"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(parseInt(e.target.value, 10) || 12)}
                    className="w-full glass-input rounded-[12px] p-3 text-sm"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setWarrantyMonths(12)}
                      className={`px-3 py-2.5 text-xs font-bold rounded-[10px] border transition-colors cursor-pointer ${
                        warrantyMonths === 12 
                          ? 'bg-white text-[#081018] border-white' 
                          : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      1 Yr
                    </button>
                    <button
                      type="button"
                      onClick={() => setWarrantyMonths(24)}
                      className={`px-3 py-2.5 text-xs font-bold rounded-[10px] border transition-colors cursor-pointer ${
                        warrantyMonths === 24 
                          ? 'bg-white text-[#081018] border-white' 
                          : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      2 Yrs
                    </button>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Price / Purchase Amount
                </label>
                <input
                  id="form-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full glass-input rounded-[12px] p-3 text-sm"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Currency
                </label>
                <select
                  id="form-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full glass-input rounded-[12px] p-3 text-sm [&>option]:bg-[#091118] [&>option]:text-white"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            {/* Expiry Summary Card */}
            {calculatedExpiry && (
              <div className="glass-panel-subtle border border-white/10 rounded-[16px] p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-white/80">Calculated Expiration Date:</span>
                </div>
                <span className="font-bold text-white font-mono text-sm">
                  {calculatedExpiry}
                </span>
              </div>
            )}

            {/* Save CTA Button */}
            <button
              type="submit"
              id="save-warranty-item-btn"
              disabled={isSaving}
              className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-white/90 text-[#081018] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-99 shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#081018]" />
                  <span>Saving to Vault...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#081018] stroke-[2.5]" />
                  <span>Save Warranty Item</span>
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
