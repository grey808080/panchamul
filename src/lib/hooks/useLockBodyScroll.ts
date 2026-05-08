'use client';

import { useEffect } from 'react';

let lockCount = 0;
let scrollY = 0;

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;

    if (lockCount === 1) {
      scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);

      if (lockCount === 0) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      }
    };
  }, [locked]);
}
