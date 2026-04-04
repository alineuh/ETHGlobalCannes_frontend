import { useEffect, useRef, useState } from 'react';

export default function NanoCounter({ value }: { value: bigint }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animRef = useRef<number>();
  const startRef = useRef<number>();
  const startValRef = useRef(0);

  useEffect(() => {
    const target = Number(value);
    const start = startValRef.current;
    const duration = 800;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    startRef.current = undefined;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = progress * (2 - progress);
      const current = start + (target - start) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        startValRef.current = target;
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value]);

  const formatted = (displayValue / 1e6).toFixed(6);
  const parts = formatted.split('.');

  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', display: 'inline-flex', alignItems: 'baseline', gap: 1 }}>
      <span style={{ fontSize: '0.8em', marginRight: 1 }}>$</span>
      <span style={{ fontWeight: 800 }}>{parts[0]}</span>
      <span style={{ opacity: 0.5 }}>.</span>
      <span style={{ fontWeight: 700 }}>{parts[1]}</span>
    </span>
  );
}
