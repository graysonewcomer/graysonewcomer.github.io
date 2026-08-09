import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { isMobile } from '../lib/device';

/**
 * Bloom, then a tone map.
 *
 * Bloom is what turns 25k flat dots into something that reads as light. It's
 * also the easiest thing on this list to overdo — crank the intensity and every
 * particle glows equally, which the eye reads as fog, not neon. The threshold is
 * doing the real work: only the brighter particles bleed, so the cloud keeps
 * internal structure instead of becoming one soft mass.
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
        // Mipmap blur gets a wide, soft glow from a few cheap downsamples
        // instead of one big expensive kernel. This is the difference between
        // bloom being viable on a phone and not.
        mipmapBlur
        // Below this luminance, a particle doesn't bloom at all. Tuned against
        // the per-particle brightness range in ParticleCloud (0.45–1.0), so the
        // dim purple mass stays matte and the green pops.
        luminanceThreshold={0.32}
        // Soften the cutoff so particles fade into blooming rather than
        // switching on — a hard edge shimmers as they drift.
        luminanceSmoothing={0.5}
        intensity={isMobile ? 0.7 : 1.1}
        // Bloom is fill-rate bound, which is exactly what mobile GPUs are worst
        // at. `levels` is the real cost knob under mipmapBlur — each level is
        // another downsample+upsample pair. Dropping 8 -> 5 cuts the widest,
        // softest (and least noticeable) part of the halo. Note that
        // `resolutionScale` is deprecated and ignored when mipmapBlur is on;
        // setting it here would look like an optimisation and do nothing.
        levels={isMobile ? 5 : 8}
        radius={0.85}
      />

      {/*
        The white-out fix, and it has to be last.
        Nothing was compressing values above 1.0. At the bottom of the page the
        crystal is at full size, refracting an environment whose Lightformer
        intensities were HDR values of 3 and 2.5 — so the frame ran far past 1.0
        and clipped to white. (Measured, not assumed: additive particle stacking
        was the obvious suspect and turned out innocent. The shell is the
        *sparsest* shape on the page, ~1 particle per 2x2px bin.)
        Khronos PBR Neutral rolls highlights off toward white while preserving
        hue and saturation. That's the distinction that matters: ACES — R3F's
        default, which `flat` on the Canvas disables — desaturates as it
        brightens and would grey out the neon. This takes the blowout and leaves
        the colour.
        It runs after Bloom deliberately: bloom should see the real HDR values,
        and only the final image gets compressed.
      */}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
