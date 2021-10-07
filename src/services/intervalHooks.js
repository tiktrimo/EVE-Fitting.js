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
    if (delay !== null && pauseFlag.current === false) {
      savedCallback.current();
      interval.current = setInterval(() => {
        savedCallback.current();
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
          interval.current = false;
        }
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    } else if (delay !== null) pauseFlag.current = false;
    else if (interval.current) pauseFlag.current = true;
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
    if (delay !== null && pauseFlag.current === false) {
      savedCallback.current();
      interval.current = setInterval(() => {
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
          interval.current = false;
        } else savedCallback.current();
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    } else if (delay !== null) pauseFlag.current = false;
    else if (interval.current) pauseFlag.current = true;
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
    if (delay !== null && pauseFlag.current === false) {
      interval.current = setInterval(() => {
        savedCallback.current();
        if (pauseFlag.current === true) {
          clearInterval(interval.current);
          pauseFlag.current = false;
          interval.current = false;
        }
      }, delay);
      return () => {
        pauseFlag.current = true;
      };
    } else if (delay !== null) pauseFlag.current = false;
    else if (interval.current) pauseFlag.current = true;
  }, [delay]);

  // clear interval at componenet dismount
  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);
}
