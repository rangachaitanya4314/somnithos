import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle star definition
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      baseAlpha: number;
      pulsePhase: number;
    }

    const stars: Star[] = [];
    const starCount = Math.floor(Math.min(width, 1600) * 0.12);

    for (let i = 0; i < starCount; i++) {
      const baseAlpha = Math.random() * 0.7 + 0.15;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: baseAlpha,
        baseAlpha,
        speed: (Math.random() * 0.04 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle drifting stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.pulsePhase += 0.015;
        star.alpha = star.baseAlpha + Math.sin(star.pulsePhase) * 0.25;
        star.y += star.speed;

        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.05, Math.min(0.9, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="ambient-background-container" aria-hidden="true">
      <canvas ref={canvasRef} className="ambient-stars-canvas" />
      <div className="ambient-nebula-top" />
      <div className="ambient-nebula-bottom" />
      <div className="ambient-vignette" />
    </div>
  );
};
