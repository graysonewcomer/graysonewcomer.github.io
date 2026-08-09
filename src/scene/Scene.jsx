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

  // Stop rendering entirely when the tab is hidden. Costs nothing to add now and
  // it's the single biggest battery win on a laptop with the page left open.
  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div className="scene">
      <Canvas
        // dpr capped at 2: a phone reporting 3 would render 2.25x the pixels for
        // no visible gain. This one line is most of your mobile performance.
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        frameloop={reduced ? 'demand' : frameloop}
        // `flat` = NoToneMapping. R3F defaults to ACES filmic, which is right for
        // photographic scenes and wrong here — it desaturates saturated colour as
        // it brightens, so it would quietly grey out the exact neon we're after.
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
