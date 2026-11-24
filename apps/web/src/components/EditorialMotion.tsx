'use client';

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

// React Bits interaction concepts, implemented with the project's existing Motion dependency.
// Only the visual asset tilts; links and reading text keep stable hit areas.
export function TiltMedia({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 190, damping: 24 });
  const rotateY = useSpring(y, { stiffness: 190, damping: 24 });
  function follow(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((.5 - (event.clientY - rect.top) / rect.height) * 8);
    y.set(((event.clientX - rect.left) / rect.width - .5) * 8);
  }
  return <div className={`editorial-tilt ${className}`} onPointerMove={follow} onPointerLeave={() => { x.set(0); y.set(0); }}>
    <motion.div style={reduced ? undefined : { rotateX, rotateY }}>{children}</motion.div>
  </div>;
}

export function HeroCharacter() {
  return <TiltMedia className="editorial-character"><img src="/images/aster-avatar.webp" srcSet="/images/aster-avatar-640.webp 640w, /images/aster-avatar-960.webp 960w, /images/aster-avatar.webp 1254w" sizes="(max-width: 767px) 120px, 200px" width="1254" height="1254" fetchPriority="high" alt="黑色短发、穿深色卫衣、手持笔记本坐在方块上的 Aster 卡通形象" /></TiltMedia>;
}

export function ProjectStackItem({ children, index, total }: { children: ReactNode; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, index === total - 1 ? 1 : .94]);
  return <div ref={ref} className="editorial-project-slot" style={{ '--stack-index': index } as CSSProperties}>
    <motion.div className="editorial-project-stage" style={reduced ? undefined : { scale }}>{children}</motion.div>
  </div>;
}
