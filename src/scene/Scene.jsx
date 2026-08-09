import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Rig } from './Rig';
import { Effects } from './Effects';
import { initScroll, prefersReducedMotion } from '../lib/scroll';
import { palette } from '../lib/theme';

export function Scene() {
  const [frameloop, setFrameloop] = useState('always');
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => initScroll(), []);

  // Stop rendering entirely when the tab is hidden — the biggest battery win
  // available on a laptop with the page left open.
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div className="scene">
      <Canvas
        // A phone reporting dpr 3 renders 2.25x the pixels for no visible gain.
        // This line is most of the mobile performance.
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        frameloop={reduced ? 'demand' : frameloop}
        // NoToneMapping — Effects.jsx applies PBR Neutral at the end of the
        // chain instead. Removing `flat` puts ACES back and greys out the neon.
        flat
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor(palette.base, 1)}
      >
        <Rig reducedMotion={reduced} />
        <Effects />
      </Canvas>
    </div>
  );
}
