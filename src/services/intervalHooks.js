import { useEffect, useRef } from "react";

//version 1
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

//version 1
export function useProgressCircleInterval(callback, delay, reset) {
  const pauseFlag = useRef(false);
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Reset timer
  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = false;
      pauseFlag.current = false;
    }
  }, [reset]);

  // Set up the interval.
  useEffect(() => {
    if (delay !== null && pauseFlag.current === false) {
      savedCallback.current();
      if (interval.current) clearInterval(interval.current);
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

//version 1
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
      if (interval.current) clearInterval(interval.current);
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

//version 2
export function useLazyActivationInterval(callback, delay, reset) {
  const cancleFlag = useRef(false);
  const savedCallback = useRef();
  const interval = useRef(false);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Reset timer
  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = false;
    }
  }, [reset]);

  // Set up the interval.
  useEffect(() => {
    if (delay !== null) {
      if (interval.current) clearInterval(interval.current);
      interval.current = setInterval(() => {
        savedCallback.current();
        if (cancleFlag.current === true) {
          clearInterval(interval.current);
          interval.current = false;
          cancleFlag.current = false;
        }
      }, delay);
      cancleFlag.current = false;
    } else cancleFlag.current = true;
  }, [delay]);

  // clear interval at componenet dismount
  useEffect(() => {
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, []);
}
