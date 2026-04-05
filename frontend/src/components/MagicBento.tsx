import { useRef, useState } from 'react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function BentoCard({ children, glowColor = '37,99,235', style, onClick }: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: '50%', y: '50%' });
  const [glowIntensity, setGlowIntensity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x: `${x}%`, y: `${y}%` });
    setGlowIntensity(1);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setGlowIntensity(0);
    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(${glowColor},0.15)`;
      }}
      style={{
        position: 'relative',
        background: '#0a0f1e',
        border: '1px solid rgba(37,99,235,0.2)',
        borderRadius: 6,
        padding: '12px 14px',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        ...style,
      }}
    >
      {/* Radial glow fill */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 'inherit',
        background: `radial-gradient(200px circle at ${glowPos.x} ${glowPos.y}, rgba(${glowColor},${glowIntensity * 0.12}) 0%, transparent 70%)`,
        pointerEvents: 'none',
        transition: 'opacity 0.3s',
      }}/>
      {/* Border glow */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: 'inherit',
        padding: 1,
        background: `radial-gradient(200px circle at ${glowPos.x} ${glowPos.y}, rgba(${glowColor},${glowIntensity * 0.6}) 0%, transparent 60%)`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
