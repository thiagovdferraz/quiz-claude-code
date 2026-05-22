"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface TimerProps {
  durationMs: number;
  running: boolean;
  onExpire: () => void;
}

export function Timer({ durationMs, running, onExpire }: TimerProps) {
  const progress = useMotionValue(1);
  const onExpireRef = useRef(onExpire);
  useLayoutEffect(() => {
    onExpireRef.current = onExpire;
  });

  const bgColor = useTransform(
    progress,
    [0, 0.3, 0.6, 1],
    ["#ef4444", "#f59e0b", "#84cc16", "#10b981"]
  );

  useEffect(() => {
    if (!running) return;
    progress.set(1);
    const controls = animate(progress, 0, {
      duration: durationMs / 1000,
      ease: "linear",
      onComplete: () => onExpireRef.current(),
    });
    return () => controls.stop();
  }, [running, durationMs, progress]);

  const width = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <div
      className="w-full h-2 bg-border rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Tempo restante"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div className="h-full rounded-full" style={{ width, backgroundColor: bgColor }} />
    </div>
  );
}
