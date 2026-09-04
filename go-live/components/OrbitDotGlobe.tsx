"use client";

import React, { useEffect, useRef } from "react";

interface OrbitDotGlobeProps {
  isSearching: boolean;
  isAvailable: boolean | null;
}

export const OrbitDotGlobe: React.FC<OrbitDotGlobeProps> = ({
  isSearching,
  isAvailable
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let rotationY = 0;
    let rotationX = 0.2;

    const dotsCount = 420;
    const radius = 130;
    const dots: Array<{ x: number; y: number; z: number }> = [];

    // Fibonacci sphere distribution
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < dotsCount; i++) {
      const y = 1 - (i / (dotsCount - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      dots.push({ x: x * radius, y: y * radius, z: z * radius });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Speed up rotation when searching
      const speed = isSearching ? 0.035 : 0.008;
      rotationY += speed;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // Determine dot color based on state
      let dotColor = "rgba(27, 77, 255, 0.4)";
      if (isSearching) {
        dotColor = "rgba(27, 77, 255, 0.85)";
      } else if (isAvailable === true) {
        dotColor = "rgba(16, 185, 129, 0.9)";
      } else if (isAvailable === false) {
        dotColor = "rgba(179, 38, 30, 0.9)";
      }

      dots.forEach((dot) => {
        // Rotate Y
        const x1 = dot.x * cosY - dot.z * sinY;
        const z1 = dot.z * cosY + dot.x * sinY;

        // Rotate X
        const y1 = dot.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + dot.y * sinX;

        // Perspective projection
        const scale = 380 / (380 + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;
        const alpha = Math.max(0.1, (z2 + radius) / (radius * 2));
        const size = Math.max(0.8, scale * 1.8);

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = dotColor.replace(/[\d\.]+\)$/, `${alpha})`);
        ctx.fill();
      });

      // Subtle Outer Orbit Ring
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.25, radius * 0.4, -0.2, 0, Math.PI * 2);
      ctx.strokeStyle = isSearching ? "rgba(27, 77, 255, 0.3)" : "rgba(218, 221, 214, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSearching, isAvailable]);

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] flex items-center justify-center pointer-events-none">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
