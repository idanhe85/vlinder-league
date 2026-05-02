'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

type Variant = 'primary' | 'secondary' | 'surface';

interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant;
}

const CLASS_MAP: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  surface:   'btn-surface',
};

/**
 * Drop-in replacement for <button className="btn-primary|secondary|surface">.
 * Adds a 0.95 scale-down on tap via Framer Motion whileTap.
 */
export function MotionButton({
  variant = 'primary',
  className = '',
  disabled,
  children,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      disabled={disabled}
      className={[CLASS_MAP[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </motion.button>
  );
}
