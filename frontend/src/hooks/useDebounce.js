import { useState, useEffect, useCallback } from 'react';

/**
 * Returns a debounced value that updates after `delay` ms of no changes.
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in ms
 * @returns debounced value
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Returns [value, setValue, debouncedValue]. Good for inputs that drive URL/API:
 * value is immediate for controlled input, debouncedValue updates after delay.
 */
export function useDebouncedState(initialValue, delay) {
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, delay);
    return [value, setValue, debouncedValue];
}
