import { describe, it, beforeAll, afterEach, afterAll, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import ScanPage from './ScanPage';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Increased timeout to handle Framer Motion animations
describe('ScanPage Critical Flows', { timeout: 20000 }, () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  afterAll(() => {
    server.close();
  });

  it('displays Safety Badge on happy path', async () => {
    // 🛠️ FIX: Inject the required condition into localStorage
    // Your app checks for this to enable the Scan button
    window.localStorage.setItem('healthCondition', 'Diabetes');
    window.localStorage.setItem('userCondition', 'Diabetes'); // Cover both potential keys
    
    const user = userEvent.setup();
    render(<ScanPage />);
    
    // 1. Setup Mock File
    const file = new File(['(binary data)'], 'salad.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');

    // 2. Trigger selection (Directly using fireEvent for reliability with hidden inputs)
    fireEvent.change(input, { target: { files: [file] } });

    // 3. Locate the Scan Button
    const scanButton = await screen.findByRole('button', { name: /scan food/i });
    
    // 4. Wait for the button to enable (Condition is now set, so it will unlock)
    await waitFor(() => {
      expect(scanButton).not.toBeDisabled();
    }, { timeout: 10000 });

    // 5. Click the button
    await user.click(scanButton);
    
    // 6. Verify Results appear from MSW
    await waitFor(() => {
      expect(screen.getByText(/Safe to eat/i)).toBeInTheDocument();
      expect(screen.getByText(/Mock Healthy Salad/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('shows error message when API returns a 500 error', async () => {
    // 🛠️ FIX: Inject the required condition
    window.localStorage.setItem('healthCondition', 'Diabetes');
    
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
      // API Error text from your backend/utils/apiErrorHandler.js
      expect(screen.getByText(/API unavailable/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});