import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { TestModeManager } from '../TestModeManager';

describe('TestModeManager', () => {
  it('should not render banner when test mode is inactive', () => {
    render(<TestModeManager />);
    expect(screen.queryByText('GTM TEST MODE ACTIVE')).not.toBeInTheDocument();
  });

  it('should render banner when test mode is active', () => {
    render(<TestModeManager />);

    act(() => {
      (window as any).enableTestMode();
    });

    expect(screen.getByText('GTM TEST MODE ACTIVE')).toBeInTheDocument();
  });

  it('should add enableTestMode and disableTestMode to window object', () => {
    render(<TestModeManager />);
    expect(window).toHaveProperty('enableTestMode');
    expect(window).toHaveProperty('disableTestMode');
  });

  it('should remove enableTestMode and disableTestMode from window object on unmount', () => {
    const { unmount } = render(<TestModeManager />);
    unmount();
    expect(window).not.toHaveProperty('enableTestMode');
    expect(window).not.toHaveProperty('disableTestMode');
  });
});