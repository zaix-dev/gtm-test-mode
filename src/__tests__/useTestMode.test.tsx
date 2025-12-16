import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useTestMode } from '../useTestMode';

describe('useTestMode', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('should initialize with test mode disabled', () => {
    const { result } = renderHook(() => useTestMode());
    expect(result.current.isTestModeActive).toBe(false);
  });

  it('should enable test mode', () => {
    const { result } = renderHook(() => useTestMode());

    act(() => {
      result.current.enableTestMode();
    });

    expect(result.current.isTestModeActive).toBe(true);
    expect(sessionStorage.getItem('testModeActive')).toBe('true');
  });

  it('should disable test mode', () => {
    const { result } = renderHook(() => useTestMode());

    act(() => {
      result.current.enableTestMode();
    });

    act(() => {
      result.current.disableTestMode();
    });

    expect(result.current.isTestModeActive).toBe(false);
    expect(sessionStorage.getItem('testModeActive')).toBe('false');
  });

  it('should read the initial state from sessionStorage', () => {
    sessionStorage.setItem('testModeActive', 'true');
    const { result } = renderHook(() => useTestMode());
    expect(result.current.isTestModeActive).toBe(true);
  });

  it('should update when storage changes', () => {
    const { result } = renderHook(() => useTestMode());

    act(() => {
      sessionStorage.setItem('testModeActive', 'true');
      window.dispatchEvent(new Event('testModeChange'));
    });

    expect(result.current.isTestModeActive).toBe(true);
  });
});