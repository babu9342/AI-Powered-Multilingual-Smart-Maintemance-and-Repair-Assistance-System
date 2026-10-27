import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, VideoIcon, CheckIcon } from './Icons';

export default function CameraScanner({ onImageCaptured, visionData }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // When isCameraActive becomes true and stream is ready, attach to video
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access.');
      }

      // Request live camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);

      // Attach stream to video element safely
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            console.warn('Video play error:', err);
          });
        }
      }, 100);
    } catch (err) {
      console.warn('Camera access error:', err);
      let msg = 'கேமரா அனுமதி மறுக்கப்பட்டது அல்லது கேமரா கிடைக்கவில்லை.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied in your browser settings. Please allow camera access or upload a photo.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this system. Please upload a photo from your files.';
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      // Draw current video frame onto canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setImageSrc(dataUrl);
      stopCamera();
      if (onImageCaptured) {
        onImageCaptured(dataUrl);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        setImageSrc(dataUrl);
        if (onImageCaptured) {
          onImageCaptured(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageSrc(null);
    if (onImageCaptured) {
      onImageCaptured(null);
    }
  };

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: '1.25rem',
      marginBottom: '1rem',
      textAlign: 'center'
    }}>
      {/* Live Camera Viewfinder */}
      {isCameraActive && (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0f172a', marginBottom: '1rem' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxHeight: 360, display: 'block', objectFit: 'contain' }}
          />

          {/* Viewfinder Target Reticle Overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            border: '2px dashed #38bdf8',
            borderRadius: 12,
            pointerEvents: 'none'
          }}>
            <div style={{ position: 'absolute', bottom: -28, width: '100%', textAlign: 'center', fontSize: '0.78rem', color: '#e0f2fe', fontWeight: 600 }}>
              பழுதான பகுதியை மையத்தில் வைக்கவும்
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 14,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 12
          }}>
            <button
              type="button"
              className="btn btn-success"
              onClick={captureSnapshot}
              style={{ padding: '9px 20px', fontSize: '0.92rem' }}
            >
              📸 Capture Photo / படம் எடு
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={stopCamera}
              style={{ padding: '9px 16px', fontSize: '0.9rem' }}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Captured Image Preview */}
      {imageSrc && !isCameraActive && (
        <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #10b981' }}>
          <img
            src={imageSrc}
            alt="Defect Snapshot"
            style={{ maxWidth: '100%', maxHeight: 260, display: 'block', borderRadius: 12 }}
          />
          <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            display: 'flex',
            gap: 6
          }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={clearImage}
            >
              ✕ Remove
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={startCamera}
            >
              🔄 Retake
            </button>
          </div>
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: '#10b981',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            ✓ Photo Attached
          </div>
        </div>
      )}

      {/* Camera Error Message */}
      {cameraError && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          ⚠️ {cameraError}
        </div>
      )}

      {/* Default Controls: Open Camera or Upload */}
      {!imageSrc && !isCameraActive && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={startCamera}
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <VideoIcon size={18} color="#fff" /> Open Live Camera / கேமராவைத் திற
            </button>

            <label
              className="btn btn-secondary"
              style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <CameraIcon size={18} color="#2563eb" /> Upload from Files / படம் பதிவேற்று
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>
            Supports laptop webcam, mobile phone cameras, or uploading JPEG/PNG photos.
          </p>
        </div>
      )}
    </div>
  );
}
