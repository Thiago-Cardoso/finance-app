/**
 * Tests for useDebounce hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDebounce, useDebouncedCallback } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should still be 'initial' immediately
    expect(result.current).toBe('initial');

    // Advance timers
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Make rapid changes
    rerender({ value: 'change1' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'change2' });
    act(() => jest.advanceTimersByTime(100));

    rerender({ value: 'change3' });
    act(() => jest.advanceTimersByTime(100));

    // Should still be 'initial' because timer keeps resetting
    expect(result.current).toBe('initial');

    // Advance the rest of the time
    act(() => jest.advanceTimersByTime(200));

    // Now should be 'change3' (the last value)
    expect(result.current).toBe('change3');
  });

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });

    // Should not change at 300ms
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('initial');

    // Should change at 500ms
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('updated');
  });

  it('should work with different types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });
    act(() => jest.advanceTimersByTime(300));
    expect(numberResult.current).toBe(42);

    // Test with object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { foo: 'bar' } } }
    );

    const newObj = { foo: 'baz' };
    objectRerender({ value: newObj });
    act(() => jest.advanceTimersByTime(300));
    expect(objectResult.current).toEqual(newObj);
  });

  it('should cleanup on unmount', () => {
    const { result, unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Unmount before timer fires
    unmount();

    // This should not throw
    act(() => jest.advanceTimersByTime(300));
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Call the debounced callback
    act(() => {
      result.current('arg1');
    });

    // Callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance timers
    act(() => jest.advanceTimersByTime(300));

    // Now callback should have been called
    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous calls on rapid invocations', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Make rapid calls
    act(() => {
      result.current('call1');
    });
    act(() => jest.advanceTimersByTime(100));

    act(() => {
      result.current('call2');
    });
    act(() => jest.advanceTimersByTime(100));

    act(() => {
      result.current('call3');
    });

    // Callback should not have been called
    expect(callback).not.toHaveBeenCalled();

    // Advance the full time
    act(() => jest.advanceTimersByTime(300));

    // Callback should only have been called once with the last argument
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('call3');
  });
});
