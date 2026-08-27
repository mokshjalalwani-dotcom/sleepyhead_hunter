'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { computeEAR, LEFT_EYE, RIGHT_EYE } from './AlarmEngine';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const WebcamCanvas = forwardRef(function WebcamCanvas(
  { onEAR, onFaceDetected, running },
  ref
) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef    = useRef(null);
  const streamRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // Init MediaPipe
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
      if (!cancelled) landmarkerRef.current = landmarker;
    }

    init().catch(console.error);
    return () => { cancelled = true; };
  }, []);

  // Webcam stream
  useEffect(() => {
    if (!running) {
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scheduleFrame();
        }
      } catch (err) {
        console.error('Webcam error:', err);
        onFaceDetected && onFaceDetected(false);
      }
    }

    startCam();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function scheduleFrame() {
    rafRef.current = requestAnimationFrame(processFrame);
  }

  function processFrame() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    const lmk    = landmarkerRef.current;

    if (!video || !canvas || video.readyState < 2) {
      scheduleFrame();
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    // Mirror the feed
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Run face landmarker
    if (lmk) {
      try {
        const ts = performance.now();
        const result = lmk.detectForVideo(video, ts);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0];
          onFaceDetected && onFaceDetected(true);

          const leftEAR  = computeEAR(landmarks, LEFT_EYE);
          const rightEAR = computeEAR(landmarks, RIGHT_EYE);
          const avgEAR   = (leftEAR + rightEAR) / 2;
          onEAR && onEAR(avgEAR);

          drawOverlay(ctx, canvas, landmarks, avgEAR);
        } else {
          onFaceDetected && onFaceDetected(false);
          onEAR && onEAR(null);
          drawNoFace(ctx, canvas);
        }
      } catch {
        // landmarker not ready yet
      }
    }

    scheduleFrame();
  }

  function drawOverlay(ctx, canvas, landmarks, ear) {
    const W = canvas.width;
    const H = canvas.height;

    // Draw eye landmark dots (mirrored)
    const eyeIndices = [
      ...LEFT_EYE, ...RIGHT_EYE,
      // additional eye outline points for visual clarity
      ...[159, 145, 386, 374],
    ];

    eyeIndices.forEach((idx) => {
      const lm = landmarks[idx];
      const x = (1 - lm.x) * W; // mirror
      const y = lm.y * H;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = ear < 0.21 ? 'rgba(255,61,87,0.9)' : 'rgba(0,229,255,0.9)';
      ctx.fill();
    });

    // Connect eye outline
    [LEFT_EYE, RIGHT_EYE].forEach((indices) => {
      ctx.beginPath();
      indices.forEach((idx, i) => {
        const lm = landmarks[idx];
        const x = (1 - lm.x) * W;
        const y = lm.y * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = ear < 0.21 ? 'rgba(255,61,87,0.7)' : 'rgba(0,229,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function drawNoFace(ctx, canvas) {
    ctx.font = 'bold 18px Space Grotesk, sans-serif';
    ctx.fillStyle = 'rgba(255,61,87,0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('No face detected', canvas.width / 2, 40);
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', background: '#020c18' }}>
      {/* Hidden video element for MediaPipe input */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
        aria-hidden="true"
      />
      {/* Canvas shows mirrored + annotated feed */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label="Live webcam feed with eye tracking overlay"
      />
      {!running && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(2,12,24,0.92)',
            color: 'var(--text-muted)',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '64px' }}>😴</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Camera is off
          </span>
        </div>
      )}
    </div>
  );
});

export default WebcamCanvas;
