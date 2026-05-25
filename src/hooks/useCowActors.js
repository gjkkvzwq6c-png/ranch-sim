import { useState, useEffect, useCallback } from 'react';

const MAX_VISIBLE = 35;

function makeCow(id, entering = false) {
  const x = entering ? -12 : 6 + Math.random() * 84;
  const y = entering ? 30 + Math.random() * 25 : 5 + Math.random() * 82;
  return {
    id,
    x,
    y,
    targetX: 8 + Math.random() * 82,
    targetY: 5 + Math.random() * 82,
    state: entering ? 'entering' : Math.random() > 0.55 ? 'graze' : 'wander',
    grazeTimer: entering ? 0 : 1500 + Math.random() * 4500,
    facing: 'right',
    scale: 0.78 + Math.random() * 0.34,
    bobOffset: Math.random() * Math.PI * 2,
  };
}

export function useCowActors(cowCount) {
  const [actors, setActors] = useState(() =>
    Array.from({ length: Math.min(cowCount, MAX_VISIBLE) }, (_, i) => makeCow(i))
  );

  // Sync visible count with game state (without killing animation state)
  useEffect(() => {
    setActors((prev) => {
      const target = Math.min(cowCount, MAX_VISIBLE);
      if (prev.length === target) return prev;
      if (prev.length < target) {
        const extras = Array.from({ length: target - prev.length }, (_, i) =>
          makeCow(Date.now() + i)
        );
        return [...prev, ...extras];
      }
      return prev.slice(0, target);
    });
  }, [cowCount]);

  // Animation tick at 100ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      setActors((prev) =>
        prev.map((cow) => {
          const dx = cow.targetX - cow.x;
          const dy = cow.targetY - cow.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (cow.state === 'entering') {
            if (dist < 2)
              return { ...cow, x: cow.targetX, y: cow.targetY, state: 'graze', grazeTimer: 2000 + Math.random() * 3000 };
            const spd = 1.6;
            return { ...cow, x: cow.x + (dx / dist) * spd, y: cow.y + (dy / dist) * spd, facing: dx >= 0 ? 'right' : 'left' };
          }

          if (cow.state === 'graze') {
            const t = cow.grazeTimer - 100;
            if (t <= 0) {
              return {
                ...cow,
                state: 'wander',
                grazeTimer: 0,
                targetX: Math.max(4, Math.min(94, cow.x + (Math.random() - 0.5) * 55)),
                targetY: Math.max(4, Math.min(94, cow.y + (Math.random() - 0.5) * 40)),
              };
            }
            return { ...cow, grazeTimer: t };
          }

          // wander
          if (dist < 2)
            return { ...cow, state: 'graze', grazeTimer: 1800 + Math.random() * 5000 };

          const spd = 0.38;
          return {
            ...cow,
            x: cow.x + (dx / dist) * spd,
            y: cow.y + (dy / dist) * spd,
            facing: dx >= 0 ? 'right' : 'left',
          };
        })
      );
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  const addEnteringCow = useCallback(() => {
    setActors((prev) => {
      const c = makeCow(Date.now(), true);
      c.targetX = 12 + Math.random() * 68;
      c.targetY = 15 + Math.random() * 65;
      if (prev.length >= MAX_VISIBLE) return [...prev.slice(1), c];
      return [...prev, c];
    });
  }, []);

  return { actors, addEnteringCow };
}
