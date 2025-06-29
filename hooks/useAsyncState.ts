/**
 * Async State Management Hook
 * 
 * Prevents race conditions in React components by properly managing
 * async operations and cancelling stale requests.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
}

export interface UseAsyncStateOptions {
  /**
   * Initial data value
   */
  initialData?: any;
  
  /**
   * Whether to execute the async function immediately on mount
   */
  immediate?: boolean;
  
  /**
   * Dependencies that trigger re-execution when changed
   */
  deps?: React.DependencyList;
  
  /**
   * Timeout in milliseconds for the async operation
   */
  timeout?: number;
  
  /**
   * Whether to retain data from previous successful requests during loading
   */
  keepPreviousData?: boolean;
  
  /**
   * Retry configuration
   */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Hook for managing async state with race condition prevention
 */
export function useAsyncState<T>(
  asyncFn: () => Promise<T>,
  options: UseAsyncStateOptions = {}
) {
  const {
    initialData = null,
    immediate = true,
    deps = [],
    timeout = 10000,
    keepPreviousData = false,
    retry = { attempts: 0, delay: 1000 }
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: immediate,
    error: null,
    isStale: false,
  });

  const abortControllerRef = useRef<AbortController>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Execute async function with race condition prevention
  const execute = useCallback(
    async (retryAttempt = 0): Promise<void> => {
      // Cancel previous request
      cleanup();

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const currentController = abortControllerRef.current;

      // Set loading state
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        isStale: false,
      }));

      // Set timeout
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          if (!currentController.signal.aborted) {
            currentController.abort();
          }
        }, timeout);
      }

      try {
        const result = await asyncFn();

        // Check if request was cancelled or component unmounted
        if (currentController.signal.aborted || !isMountedRef.current) {
          return;
        }

        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Reset retry count on success
        retryCountRef.current = 0;

        // Update state with result
        setState({
          data: result,
          loading: false,
          error: null,
          isStale: false,
        });
      } catch (error) {
        // Check if request was cancelled or component unmounted
        if (currentController.signal.aborted || !isMountedRef.current) {
          return;
        }

        const errorObj = error instanceof Error ? error : new Error('Unknown error');

        // Handle retry logic
        if (retry.attempts > 0 && retryAttempt < retry.attempts) {
          retryCountRef.current = retryAttempt + 1;
          
          // Delay before retry
          setTimeout(() => {
            if (!currentController.signal.aborted && isMountedRef.current) {
              execute(retryAttempt + 1);
            }
          }, retry.delay);
          
          return;
        }

        // Update state with error
        setState(prev => ({
          data: keepPreviousData ? prev.data : null,
          loading: false,
          error: errorObj,
          isStale: keepPreviousData && prev.data !== null,
        }));
      }
    },
    [asyncFn, timeout, keepPreviousData, retry, cleanup]
  );

  // Manual execute function
  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return execute();
  }, [execute]);

  // Reset function
  const reset = useCallback(() => {
    cleanup();
    setState({
      data: initialData,
      loading: false,
      error: null,
      isStale: false,
    });
  }, [cleanup, initialData]);

  // Effect to execute on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      cleanup();
    };
  }, [immediate, execute, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    ...state,
    execute: refetch,
    refetch,
    reset,
    isRetrying: retryCountRef.current > 0,
    retryCount: retryCountRef.current,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncStateGroup<T extends Record<string, () => Promise<any>>>(
  asyncFunctions: T,
  options: UseAsyncStateOptions = {}
) {
  type StateKeys = keyof T;
  type StateData = {
    [K in StateKeys]: AsyncState<Awaited<ReturnType<T[K]>>>;
  };

  const [states, setStates] = useState<StateData>(() => {
    const initialStates = {} as StateData;
    for (const key in asyncFunctions) {
      initialStates[key] = {
        data: null,
        loading: options.immediate !== false,
        error: null,
        isStale: false,
      };
    }
    return initialStates;
  });

  const controllersRef = useRef<Record<string, AbortController>>({});
  const isMountedRef = useRef(true);

  const executeAll = useCallback(async () => {
    // Cancel all previous requests
    Object.values(controllersRef.current).forEach(controller => {
      controller.abort();
    });

    // Create new controllers
    const newControllers: Record<string, AbortController> = {};
    for (const key in asyncFunctions) {
      newControllers[key] = new AbortController();
    }
    controllersRef.current = newControllers;

    // Set all to loading
    setStates(prev => {
      const newStates = { ...prev };
      for (const key in asyncFunctions) {
        newStates[key] = {
          ...newStates[key],
          loading: true,
          error: null,
          isStale: false,
        };
      }
      return newStates;
    });

    // Execute all functions in parallel
    const promises = Object.entries(asyncFunctions).map(async ([key, fn]) => {
      const controller = newControllers[key];
      
      try {
        const result = await fn();
        
        if (!controller.signal.aborted && isMountedRef.current) {
          setStates(prev => ({
            ...prev,
            [key]: {
              data: result,
              loading: false,
              error: null,
              isStale: false,
            }
          }));
        }
      } catch (error) {
        if (!controller.signal.aborted && isMountedRef.current) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error');
          setStates(prev => ({
            ...prev,
            [key]: {
              data: options.keepPreviousData ? prev[key as StateKeys].data : null,
              loading: false,
              error: errorObj,
              isStale: options.keepPreviousData && prev[key as StateKeys].data !== null,
            }
          }));
        }
      }
    });

    await Promise.allSettled(promises);
  }, [asyncFunctions, options.keepPreviousData]);

  useEffect(() => {
    if (options.immediate !== false) {
      executeAll();
    }

    return () => {
      isMountedRef.current = false;
      Object.values(controllersRef.current).forEach(controller => {
        controller.abort();
      });
    };
  }, [executeAll, ...(options.deps || [])]);

  const loading = Object.values(states).some(state => state.loading);
  const hasError = Object.values(states).some(state => state.error);
  const allComplete = Object.values(states).every(state => !state.loading);

  return {
    states,
    loading,
    hasError,
    allComplete,
    executeAll,
    refetch: executeAll,
  };
}

/**
 * Hook for debounced async operations
 */
export function useDebouncedAsyncState<T>(
  asyncFn: () => Promise<T>,
  delay: number,
  options: UseAsyncStateOptions = {}
) {
  const [debouncedFn] = useState(() => {
    let timeoutId: NodeJS.Timeout;
    
    return () => new Promise<T>((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  });

  return useAsyncState(debouncedFn, { ...options, immediate: false });
}

export default useAsyncState;