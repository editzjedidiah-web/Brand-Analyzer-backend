"use client";
import { useEffect, useRef } from "react";

export default function FlowWave() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = 320;
    }

    resize();
    window.addEventListener("resize", resize);

    // 🖱 Track mouse for glow boost
    function handleMouseMove(e) {
      mouse.current = { x: e.clientX, y: e.clientY };
    }

    window.addEventListener("mousemove", handleMouseMove);

    let t = 2.2;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 16;
      const amplitude = 18;

      // 🎨 Brand-synced hue (CSS variable)
      const brandHue = getComputedStyle(document.documentElement)
        .getPropertyValue("--brand-hue") || 175;

      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          const wave =
            Math.sin((x + t) * 0.02) +
            Math.cos((y + t) * 0.015);

          const posY = y + wave * amplitude;

          // 🌫 Fade dots as they rise
          const fade = 1 - posY / canvas.height;

          // ✨ Glow boost near mouse
          const dx = x - mouse.current.x;
          const dy = posY - mouse.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const glowBoost = Math.max(0, 1 - dist / 120);

          const alpha = 0.35 + fade * 0.5;
          const glow = 3 + glowBoost * 10;


          ctx.shadowBlur = glow;
          ctx.shadowColor = `hsla(${brandHue}, 85%, 60%, ${alpha})`;

          ctx.beginPath();
          ctx.arc(x, posY, .8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${brandHue}, 85%, 60%, ${alpha})`;
          ctx.fill();
        }
      }

      t += 1;
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full pointer-events-none opacity-90"
    />
  );
}
