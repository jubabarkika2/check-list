import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Upload } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import { playPhotoCaptureSound } from '../utils/soundUtils';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoDataUrl: string) => void;
  taskTitle: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  taskTitle,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    stopStream();
    setCameraError(null);
    setIsLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Não foi possível abrir a câmera diretamente. Você pode tirar foto pelo botão de envio de arquivo do seu celular ou fazer upload da galeria.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    playPhotoCaptureSound();

    try {
      const compressed = await compressImage(rawDataUrl);
      setCapturedPhoto(compressed);
    } catch {
      setCapturedPhoto(rawDataUrl);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const compressed = await compressImage(file);
      setCapturedPhoto(compressed);
    } catch (err) {
      console.error('Error processing uploaded file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
              Foto Comprobatória
            </span>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base line-clamp-1">
              {taskTitle}
            </h3>
          </div>
          <button
            id="btn-close-camera"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black flex-1 min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Foto capturada"
                className="max-h-[60vh] w-auto object-contain rounded-md"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                <Check className="w-3.5 h-3.5" /> Foto Pronta
              </div>
            </div>
          ) : cameraError ? (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{cameraError}</p>
              <button
                id="btn-upload-fallback"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <Camera className="w-4 h-4" />
                Tirar Foto / Abrir Galeria
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[60vh]"
                onLoadedMetadata={() => videoRef.current?.play()}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
                </div>
              )}
              {/* Overlay guides */}
              <div className="absolute inset-6 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded w-max backdrop-blur-sm">
                  Posicione a tarefa no centro
                </div>
                <div className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded w-max self-end backdrop-blur-sm">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Controls / Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                id="btn-retake-photo"
                onClick={handleRetake}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tirar Outra
              </button>
              <button
                id="btn-confirm-photo"
                onClick={handleConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-95"
              >
                <Check className="w-4 h-4" />
                Usar Esta Foto
              </button>
            </>
          ) : (
            <>
              <button
                id="btn-gallery-file"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2 text-xs font-medium"
                title="Galeria ou Câmera do Celular"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Galeria</span>
              </button>

              <button
                id="btn-snap-photo"
                onClick={handleCapture}
                disabled={Boolean(cameraError || isLoading)}
                className="flex-1 max-w-[180px] mx-auto py-3 px-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <div className="w-4 h-4 rounded-full border-2 border-slate-950 bg-white"></div>
                Fotografar
              </button>

              <button
                id="btn-toggle-camera"
                onClick={toggleFacingMode}
                disabled={Boolean(cameraError || isLoading)}
                className="p-3 text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-40"
                title="Trocar Câmera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
