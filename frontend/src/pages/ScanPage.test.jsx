import { describe, it, beforeAll, afterEach, afterAll, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ScanPage from './ScanPage';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Key must match STORAGE_KEY in ScanPage.jsx
const STORAGE_KEY = "nutriguard";

describe('ScanPage Critical Flows', { timeout: 20000 }, () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  it('displays Safety Badge on happy path', async () => {
    // 🛠️ FIX: Use the exact key defined in ScanPage.jsx
    window.localStorage.setItem(STORAGE_KEY, 'diabetes');
    
    const user = userEvent.setup();
    render(<ScanPage />);
    
    // 1. Prepare Mock File
    const file = new File(['(binary data)'], 'salad.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    // 2. Upload File
    fireEvent.change(input, { target: { files: [file] } });

    // 3. Find and click Scan Button
    const scanButton = await screen.findByRole('button', { name: /scan food/i });
    
    // Should now be enabled because "nutriguard" key exists in localStorage
    await waitFor(() => {
      expect(scanButton).not.toBeDisabled();
    }, { timeout: 10000 });

    await user.click(scanButton);
    
    // 4. Verify Results from MSW
    await waitFor(() => {
      // These strings must exist in your i18n locales or match MSW mock
      expect(screen.getByText(/Mock Healthy Salad/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('shows error message when API returns a 500 error', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'diabetes');
    const user = userEvent.setup();
    
    server.use(
      http.post('*/analyze', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<ScanPage />);
    
    const file = new File(['(binary data)'], 'salad.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    const scanButton = await screen.findByRole('button', { name: /scan food/i });
    
    await waitFor(() => expect(scanButton).not.toBeDisabled(), { timeout: 10000 });
    await user.click(scanButton);
    
    await waitFor(() => {
      // This will catch any error message displayed in the red error box
      expect(screen.getByRole('alert') || screen.getByText(/Analysis failed/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});