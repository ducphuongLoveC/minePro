import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

export interface CounterClockHandle {
  start: () => void;
  reset: () => void;
  destroy: () => void;
}

const CounterClock = forwardRef<CounterClockHandle>((_, ref) => {
  const [display, setDisplay] = useState('001');
  const counterRef = useRef<number>(1);
  const interRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const handleCounter = () => {
    clearInterval(interRef.current);
    interRef.current = setInterval(() => {
      counterRef.current += 1;
      const formatted = String(counterRef.current).padStart(3, '0');
      setDisplay(formatted);
    }, 1000);
  };

  const handleDestroyCounter = () => {
    clearInterval(interRef.current);
  };

  const handleReset = () => {
    counterRef.current = 0;
    setDisplay('000');
  };

  useImperativeHandle(ref, () => ({
    start: handleCounter,
    reset: handleReset,
    destroy: handleDestroyCounter,
  }));

  useEffect(() => {
    return () => {
      clearInterval(interRef.current);
    };
  }, []);

  return <span>{display}</span>;
});

export default CounterClock;
