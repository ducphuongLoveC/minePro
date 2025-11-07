import { useEffect, useCallback } from 'react';

type KeyboardShortcutOptions = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
};

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void,
  enabled: boolean = true
): void {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrl = false, shift = false, alt = false, preventDefault = true } = options;

      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
      const isCtrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const isShiftMatch = shift ? event.shiftKey : !event.shiftKey;
      const isAltMatch = alt ? event.altKey : !event.altKey;

      if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    },
    [options, callback]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, enabled]);
}

// Hook để đăng ký nhiều shortcuts
export function useKeyboardShortcuts(
  shortcuts: Array<{
    options: KeyboardShortcutOptions;
    callback: () => void;
    enabled?: boolean;
  }>
): void {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      shortcuts.forEach(({ options, callback, enabled = true }) => {
        if (!enabled) return;

        const { key, ctrl = false, shift = false, alt = false, preventDefault = true } = options;

        const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
        const isCtrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isShiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const isAltMatch = alt ? event.altKey : !event.altKey;

        if (isKeyMatch && isCtrlMatch && isShiftMatch && isAltMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [shortcuts]);
}

