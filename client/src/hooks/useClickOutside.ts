// src/hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

/**
 * Calls `handler` when a click or touch occurs outside the element referenced by `ref`.
 *
 * @param ref - React ref object pointing to the DOM element.
 * @param handler - Callback to invoke when an outside click is detected.
 */
export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
