import { onUnmounted } from 'vue';

export interface UseRippleOptions {
  /** animation duration in ms */
  duration?: number;
  /** peak opacity of the ripple (uses `currentColor`) */
  peakOpacity?: number;
}

/**
 * Material-style ripple driven by `currentColor`, so it automatically follows
 * the host element's text color: theme color for ghost/outline/link variants,
 * foreground color for solid variants. Works across light/dark and theme-color
 * switches with no extra wiring.
 *
 * The host element must be `position: relative` + `overflow: hidden` so the
 * ripple is clipped to its bounds. Attach the returned `trigger` to the
 * element's `@pointerdown`.
 */
export function useRipple(options: UseRippleOptions = {}) {
  const duration = options.duration ?? 550;
  const peakOpacity = options.peakOpacity ?? 0.35;

  const active = new Set<Animation>();

  function trigger(event: PointerEvent | MouseEvent): void {
    const el = event.currentTarget as HTMLElement | null;
    if (!el) return;
    // Respect disabled / loading state.
    if (el.hasAttribute('disabled') || el.dataset.disabled !== undefined) return;
    // Primary pointer / touch only.
    if (event.button !== 0) return;

    const rect = el.getBoundingClientRect();
    // Diameter covers the diagonal so the ripple can reach every corner from
    // any click point.
    const diameter = Math.hypot(rect.width, rect.height);
    const radius = diameter / 2;

    const hasCoords =
      'clientX' in event && typeof event.clientX === 'number' && event.clientX !== 0;
    const cx = hasCoords ? event.clientX - rect.left : rect.width / 2;
    const cy = hasCoords ? event.clientY - rect.top : rect.height / 2;

    const ripple = document.createElement('span');
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.cssText = [
      'position:absolute',
      'border-radius:9999px',
      'pointer-events:none',
      `left:${cx - radius}px`,
      `top:${cy - radius}px`,
      `width:${diameter}px`,
      `height:${diameter}px`,
      'background:currentColor',
      'transform:scale(0)',
      'transform-origin:center',
      'z-index:0',
    ].join(';');

    el.appendChild(ripple);

    const animation = ripple.animate(
      [
        { transform: 'scale(0)', opacity: peakOpacity },
        { transform: 'scale(2)', opacity: 0 },
      ],
      { duration, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' }
    );

    active.add(animation);
    const cleanup = () => {
      ripple.remove();
      active.delete(animation);
    };
    animation.addEventListener('finish', cleanup);
    animation.addEventListener('cancel', cleanup);
  }

  onUnmounted(() => {
    active.forEach((a) => a.cancel());
    active.clear();
  });

  return { trigger };
}
