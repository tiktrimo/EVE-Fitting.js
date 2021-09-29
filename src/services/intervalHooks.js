import { useEffect, useRef } from "react";

export function useAlwaysActivationInterval(callback, delay) {
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      interval.current = setInterval(() => {
        tick();
      }, delay);
      return () => {
        clearInterval(interval.current);
      };
    }
  }, [delay]);
}

export function useProgressCircleInterval(callback, delay) {
  const pauseFlag = useRef(false);
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      tick();
      interval.current = setInterval(() => {
        tick();
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
        }
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    }
  }, [delay]);

  // clear interval at componenet dismount
  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);
}

export function useInstaActivationInterval(callback, delay) {
  const pauseFlag = useRef(false);
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      tick();
      interval.current = setInterval(() => {
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
        } else tick();
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    }
  }, [delay]);

  // clear interval at componenet dismount
  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);
}

export function useLazyActivationInterval(callback, delay) {
  const pauseFlag = useRef(false);
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      interval.current = setInterval(() => {
        tick();
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
        }
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    }
  }, [delay]);

  // clear interval at componenet dismount
  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);
}
