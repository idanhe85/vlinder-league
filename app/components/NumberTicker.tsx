'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  /** Duration in seconds (default 1.5) */
  duration?: number;
  className?: string;
  /** Locale formatting — default true */
  localeFormat?: boolean;
}

/**
 * Smoothly counts up (or down) to `value` over ~1.5 s using a spring.
 * Re-animates whenever `value` changes.
 */
export function NumberTicker({
  value,
  duration = 1.5,
  className,
  localeFormat = true,
}: NumberTickerProps) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, {
    stiffness: Math.round(120 / duration),   // softer spring for longer durations
    damping:   Math.round(30  / duration),
    mass: 1,
  });
  const display = useTransform(spring, (v) =>
    localeFormat ? Math.round(v).toLocaleString() : String(Math.round(v)),
  );

  // Track previous value so the spring always starts from where it left off
  const prevRef = useRef(value);
  useEffect(() => {
    motionVal.set(prevRef.current);   // ensure starting point is current rendered value
    motionVal.set(value);             // spring will animate to this
    prevRef.current = value;
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}
