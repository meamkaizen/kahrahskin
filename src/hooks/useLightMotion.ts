import { useEffect, useState } from 'react';

/**
 * True when the page should stay visually still: on phones, or when the
 * visitor has asked their OS for reduced motion.
 *
 * Used to skip the WebGL background and the scroll-reveal animations, which
 * are the two things that make the site feel heavy on a phone.
 */
const QUERY = '(max-width: 767px), (prefers-reduced-motion: reduce)';

export function useLightMotion(): boolean {
  // Start "light" so a phone never renders the heavy version even for a frame.
  const [light, setLight] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mq = window.matchMedia(QUERY);
    const update = () => setLight(mq.matches);

    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return light;
}
