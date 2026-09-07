import { render, screen } from '@testing-library/react';
import Home from '@/pages/home';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));

const mockTimers = [
  { id: 1, title: 'Launch', duration_seconds: 3600, end_time: new Date(Date.now() + 86400000).toISOString(), status: 'active', created_at: '2025-01-01T00:00:00Z' },
  { id: 2, title: 'Done Timer', duration_seconds: 60, end_time: null, status: 'completed', created_at: '2025-01-01T00:00:00Z' },
];

beforeEach(() => { (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTimers }); });

test('renders overview with stats', async () => {
  render(<Home />);
  expect(await screen.findByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('1')).toBeInTheDocument(); // active
  expect(screen.getByText('Launch')).toBeInTheDocument();
});

test('shows error state', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Home />);
  expect(await screen.findByText('Failed to load timers')).toBeInTheDocument();
});