import { useEffect } from 'react';

export const Keys = {
  J: 106,
  K: 107,
  ENTER: 13.
};

export function useKeys(handlers: { [key: number]: () => void }): void {
  const handler = (e: KeyboardEvent) => {
    handlers[e.which]?.();
  };

  useEffect(() => {
    window.addEventListener('keypress', handler);

    return () => {
      window.removeEventListener('keypress', handler);
    };
  });
}
