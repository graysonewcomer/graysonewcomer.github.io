import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { isMobile } from '../lib/device';

/**
 * Bloom, then a tone map — in that order, and the tone map must stay last.
 *
 * Bloom turns 25k flat dots into something that reads as light, and is easy to
 * overdo: at high intensity every particle glows equally and the eye reads fog,
 * not neon. The threshold does the real work.
 */
export function Effects() {
  return (
    <EffectComposer
      // Points don't benefit from MSAA and the normal pass is only needed by
      // effects we don't have (SSAO, SSR). Both off is free performance.
      multisampling={0}
      enableNormalPass={false}
    >
      <Bloom
        // Wide soft glow from a few cheap downsamples rather than one big
        // kernel. This is what makes bloom viable on a phone.
        mipmapBlur
        // Tuned against the per-particle brightness range in ParticleCloud
        // (0.45–1.0): the dim purple mass stays matte, the green pops.
        luminanceThreshold={0.32}
        // Soft cutoff — a hard edge shimmers as particles drift across it.
        luminanceSmoothing={0.5}
        intensity={isMobile ? 0.7 : 1.1}
        // The cost knob under mipmapBlur, one downsample+upsample pair per
        // level. `resolutionScale` is ignored here; don't reach for it.
        levels={isMobile ? 5 : 8}
        radius={0.85}
      />

      {/*
        Compresses everything above 1.0, which is what keeps the bottom of the
        page from clipping to white. PBR Neutral specifically: it rolls
        highlights off while preserving hue and saturation, where ACES (R3F's
        default, disabled by `flat` on the Canvas) desaturates as it brightens
        and would grey out the neon.
      */}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
