/**
 * Debounce utility for preventing rapid-fire events
 * Useful for mobile CTAs, form submissions, etc.
 * 
 * @param ms - Milliseconds to wait between allowed calls
 * @returns Function that executes callback only if enough time has passed
 * 
 * @example
 * ```tsx
 * const safeFire = debounceOnce(600);
 * 
 * <button onMouseDown={() => safeFire(() => callClicked({ ... }))}>
 *   Call Now
 * </button>
 * ```
 */
export const debounceOnce = (ms = 600) => {
  let lastCall = 0;
  
  return (fn: () => void) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      fn();
      lastCall = now;
    }
  };
};

/**
 * Alternative: Returns a boolean indicating if enough time has passed
 * Useful for inline conditionals
 * 
 * @example
 * ```tsx
 * const canFire = debounceCheck(600);
 * if (canFire()) {
 *   trackEvent(...);
 * }
 * ```
 */
export const debounceCheck = (ms = 600) => {
  let lastCall = 0;
  
  return (): boolean => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return true;
    }
    return false;
  };
};

