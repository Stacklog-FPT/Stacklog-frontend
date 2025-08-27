import { useState, useRef } from 'react';
import { FiTrash2 } from 'react-icons/fi';

export default function HoldDeleteButton({ onConfirm, duration = 1500, size = 40, stroke = 4 }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const handleMouseDown = () => {
    clearInterval(intervalRef.current);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          onConfirm?.();
          return 100;
        }
        return prev + 1;
      });
    }, duration / 100);
  };

  const handleMouseUpOrLeave = () => {
    clearInterval(intervalRef.current);
  };

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <button
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        background: '#fff',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <FiTrash2 size={18} color="#ef4444" style={{ position: 'relative', zIndex: 2 }} />
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)',
        }}
        width={size}
        height={size}
      >
        {/* viền nền */}
        <circle
          stroke="#fee2e2"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* progress */}
        <circle
          stroke="#ef4444"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
    </button>
  );
}
