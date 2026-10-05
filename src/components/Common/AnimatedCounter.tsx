import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  durationMs = 650,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;

    if (diff === 0) {
      setDisplayValue(endValue);
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      
      // Smooth exponential easing for Apple-grade mechanical motion
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + diff * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      prevValueRef.current = endValue;
    };
  }, [value, durationMs]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
};
