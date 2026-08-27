'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedEye({ size = 240, closed = false }) {
  const lidRef = useRef(null);

  useEffect(() => {
    if (closed) return;

    // Simulate random blink
    let blinkTimeout;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 4000;
      blinkTimeout = setTimeout(() => {
        if (lidRef.current) {
          lidRef.current.style.transform = 'scaleY(0.05)';
          setTimeout(() => {
            if (lidRef.current) lidRef.current.style.transform = 'scaleY(1)';
          }, 120);
        }
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, [closed]);

  const cx = size / 2;
  const cy = size / 2;
  const rx = size * 0.38;
  const ry = size * 0.22;
  const pupilR = size * 0.09;
  const irisR = size * 0.14;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Animated eye"
      role="img"
    >
      <defs>
        {/* Glow filter */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="strong-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Iris gradient */}
        <radialGradient id="irisGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#80ffff" />
          <stop offset="40%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#005a66" />
        </radialGradient>
        {/* Sclera gradient */}
        <radialGradient id="scleraGrad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#e8f8ff" />
          <stop offset="100%" stopColor="#b0d8e8" />
        </radialGradient>
        {/* Clip path for eye shape */}
        <clipPath id="eyeClip">
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>

      {/* Outer glow ring */}
      <ellipse
        cx={cx} cy={cy} rx={rx + 12} ry={ry + 12}
        fill="none"
        stroke="rgba(0, 229, 255, 0.15)"
        strokeWidth="1"
        filter="url(#glow)"
      />
      <ellipse
        cx={cx} cy={cy} rx={rx + 6} ry={ry + 6}
        fill="none"
        stroke="rgba(0, 229, 255, 0.3)"
        strokeWidth="1"
      />

      {/* Eyeball white */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#scleraGrad)" />

      {/* Iris + Pupil group (clipped to eye shape) */}
      <g clipPath="url(#eyeClip)">
        {/* Iris */}
        <circle cx={cx} cy={cy} r={irisR} fill="url(#irisGrad)" filter="url(#glow)" />
        {/* Pupil */}
        <circle cx={cx} cy={cy} r={pupilR} fill="#020c18" />
        {/* Catchlight */}
        <circle cx={cx - pupilR * 0.4} cy={cy - pupilR * 0.5} r={pupilR * 0.3} fill="white" opacity="0.8" />
      </g>

      {/* Eye outline */}
      <ellipse
        cx={cx} cy={cy} rx={rx} ry={ry}
        fill="none"
        stroke="#00e5ff"
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* Animated eyelid */}
      <g
        ref={lidRef}
        style={{
          transformOrigin: `${cx}px ${cy - ry}px`,
          transform: closed ? 'scaleY(1)' : 'scaleY(0)',
          transition: 'transform 0.1s ease',
        }}
      >
        <ellipse
          cx={cx} cy={cy} rx={rx + 2} ry={ry + 2}
          fill="var(--bg-surface)"
          stroke="none"
        />
        {/* Eyelash hint */}
        <ellipse
          cx={cx} cy={cy - ry} rx={rx} ry={4}
          fill="#00e5ff"
          opacity="0.4"
        />
      </g>

      {/* Scan lines animation */}
      <g clipPath="url(#eyeClip)" opacity="0.12">
        <line x1={cx - rx} y1={cy - ry * 0.5} x2={cx + rx} y2={cy - ry * 0.5} stroke="#00e5ff" strokeWidth="1">
          <animate attributeName="y1" values={`${cy - ry};${cy + ry};${cy - ry}`} dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values={`${cy - ry};${cy + ry};${cy - ry}`} dur="3s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
}
