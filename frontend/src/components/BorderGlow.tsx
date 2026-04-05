import { useRef, useCallback, useEffect } from 'react';

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 220, s: 80, l: 60 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

interface BorderGlowProps {
  children: React.ReactNode;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  colors?: string[];
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function BorderGlow({
  children,
  glowColor = '220 80 60',
  backgroundColor = '#0a0f1e',
  borderRadius = 8,
  glowRadius = 40,
  glowIntensity = 0.8,
  colors = ['#3b82f6', '#1d4ed8', '#60a5fa'],
  style,
  onClick,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const getCenterOfElement = useCallback((el: HTMLDivElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el: HTMLDivElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    let kx = Infinity;
    let ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  }, [getCenterOfElement]);

  const getCursorAngle = useCallback((el: HTMLDivElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);
    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    card.style.setProperty('--cursor-x', `${((x / rect.width) * 100).toFixed(1)}%`);
    card.style.setProperty('--cursor-y', `${((y / rect.height) * 100).toFixed(1)}%`);
  }, [getEdgeProximity, getCursorAngle]);

  const handleMouseEnter = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = '0';
    const card = cardRef.current;
    if (card && onClick) card.style.transform = 'translateY(0)';
  }, [onClick]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.addEventListener('pointermove', handlePointerMove);
    return () => card.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);
  const cssVars: Record<string, string> = {
    '--card-bg': backgroundColor,
    '--edge-sensitivity': '30',
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': '25',
    '--fill-opacity': '0.3',
    '--edge-proximity': '0',
    '--cursor-angle': '45deg',
    '--cursor-x': '50%',
    '--cursor-y': '50%',
    ...glowVars,
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius: borderRadius,
        border: '1px solid rgba(37,99,235,0.15)',
        background: backgroundColor,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, transform 0.2s',
        ...style,
        ...(cssVars as React.CSSProperties),
      }}
    >
      {/* Glow overlay on hover */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at var(--cursor-x, 50%) var(--cursor-y, 50%), ${colors[0]}18 0%, transparent 65%)`,
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
