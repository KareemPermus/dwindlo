import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Timers from '@/pages/timers';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), delete: jest.fn() },
}));

const mockTimers = [
  { id: 1, title: 'Test Timer', duration_seconds: 3600, end_time: null, status: 'active', created_at: '2025-01-01T00:00:00Z' },
  { id: 2, title: 'Another', duration_seconds: 120, end_time: '2026-01-01T00:00:00Z', status: 'active', created_at: '2025-01-01T00:00:00Z' },
];

describe('Timers page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders timers after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTimers });
    render(<Timers />);
    await waitFor(() => expect(screen.getByText('Test Timer')).toBeInTheDocument());
    expect(screen.getByText('Another')).toBeInTheDocument();
    expect(screen.getByText('2 timers total')).toBeInTheDocument();
  });

  it('shows empty state', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Timers />);
    await waitFor(() => expect(screen.getByText(/No timers yet/)).toBeInTheDocument());
  });

  it('shows error and retry', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Timers />);
    await waitFor(() => expect(screen.getByText('Failed to load timers.')).toBeInTheDocument());
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('deletes a timer', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTimers });
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    render(<Timers />);
    await waitFor(() => expect(screen.getByText('Test Timer')).toBeInTheDocument());
    const deleteButtons = screen.getAllByLabelText(/Delete/);
    fireEvent.click(deleteButtons[0]);
    await waitFor(() => expect(apiClient.delete).toHaveBeenCalledWith('/api/timers/1'));
  });
});