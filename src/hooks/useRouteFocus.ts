import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Moves keyboard focus to the landmark element with the given id on every
 * route change. This ensures screen readers announce the new page content
 * without the user having to navigate manually.
 *
 * The element receives `tabindex="-1"` so it can accept programmatic focus
 * without entering the natural tab order. The attribute is removed on blur
 * so subsequent tab navigation is unaffected.
 */
export function useRouteFocus(targetId = 'main-content'): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex');
        },
        { once: true },
      );
    }, 60);

    return () => clearTimeout(id);
  }, [pathname, targetId]);
}
