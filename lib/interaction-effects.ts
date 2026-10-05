/**
 * Universal Interaction Effects Engine for ShineBypass
 * Provides real tactile haptics, Web Audio SFX, and liquid glass touch ripple effects.
 * Every effect is physically noticeable, audible, and responds to settings toggles.
 */

export type SfxType = 'click' | 'toggle-on' | 'toggle-off' | 'success' | 'tap' | 'error' | 'sparkle';
export type HapticIntensity = 'light' | 'medium' | 'heavy';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Unlock audio context on initial user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch {
      // Ignore
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
  window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
}

/**
 * Play synthesized crisp UI sound effects without external audio files
 */
export function playSfx(type: SfxType) {
  if (typeof window === 'undefined') return;
  try {
    const sfxEnabled = localStorage.getItem('shinebypass-sfx') !== 'false';
    if (!sfxEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case 'click':
      case 'tap': {
        // High crisp snap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'toggle-on': {
        // Upward pleasant pitch chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.07);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
        break;
      }
      case 'toggle-off': {
        // Downward smooth chirp
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
        break;
      }
      case 'success': {
        // Double bell chime (major chord)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now + 0.06); // E5

        g1.gain.setValueAtTime(0.22, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        g2.gain.setValueAtTime(0.25, now + 0.06);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc1.connect(g1);
        osc2.connect(g2);
        g1.connect(ctx.destination);
        g2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.2);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.28);
        break;
      }
      case 'sparkle': {
        // Triple cascade sparkle for bypass action
        [587.33, 739.99, 880.0].forEach((freq, i) => {
          const t = now + i * 0.045;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.13);
        });
        break;
      }
      case 'error': {
        // Soft double low buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
    }
  } catch {
    // Ignore audio errors
  }
}

/**
 * Trigger physical haptic vibration with tactile audio fallback
 */
export function triggerHaptic(duration: number = 30, intensity: HapticIntensity = 'medium') {
  if (typeof window === 'undefined') return;
  try {
    const hapticEnabled = localStorage.getItem('shinebypass-haptic') !== 'false';
    if (!hapticEnabled) return;

    const storedIntensity = (localStorage.getItem('shinebypass-haptic-intensity') as HapticIntensity) || intensity;
    const mult = storedIntensity === 'light' ? 0.6 : storedIntensity === 'heavy' ? 1.5 : 1.0;
    const actualDuration = Math.round(duration * mult);

    // 1. Hardware vibration for mobile phones (Android / Chrome)
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(actualDuration);
      } catch {
        // Fallback
      }
    }

    // 2. Play tactile audio click as well so desktop & iOS users also feel it
    playSfx('tap');
  } catch {
    // Ignore
  }
}

/**
 * Test patterns for the interactive playground in settings
 */
export function testHapticPattern(pattern: 'single' | 'double' | 'buzz') {
  if (typeof window === 'undefined') return;
  const hapticEnabled = localStorage.getItem('shinebypass-haptic') !== 'false';
  if (!hapticEnabled) return;

  if (pattern === 'single') {
    triggerHaptic(40, 'medium');
  } else if (pattern === 'double') {
    triggerHaptic(25, 'light');
    setTimeout(() => {
      triggerHaptic(45, 'heavy');
    }, 90);
  } else {
    // Heavy triple buzz
    triggerHaptic(60, 'heavy');
    setTimeout(() => triggerHaptic(60, 'heavy'), 100);
    setTimeout(() => triggerHaptic(90, 'heavy'), 200);
    playSfx('sparkle');
  }
}

/**
 * Creates an interactive liquid ripple wave on the clicked/tapped target
 */
export function spawnLiquidRipple(x: number, y: number) {
  if (typeof document === 'undefined') return;
  try {
    const rippleEnabled = localStorage.getItem('shinebypass-ripple') !== 'false';
    if (!rippleEnabled) return;

    const ripple = document.createElement('span');
    ripple.className = 'shine-touch-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  } catch {
    // Ignore
  }
}

/**
 * Initialize global interactive listeners
 */
export function initInteractionEngine() {
  if (typeof window === 'undefined') return;
  try {
    // Global touch/pointer ripple listener
    const handlePointerDown = (e: PointerEvent) => {
      const rippleEnabled = localStorage.getItem('shinebypass-ripple') !== 'false';
      if (!rippleEnabled) return;

      // Check if clicking inside interactive element or screen
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Spawn liquid glow ripple
      spawnLiquidRipple(e.clientX, e.clientY);
    };

    window.removeEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  } catch {
    // Ignore
  }
}
