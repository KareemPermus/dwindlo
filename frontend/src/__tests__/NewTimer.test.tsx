import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewTimer from '@/pages/newtimer';
import apiClient from '@/api/client';

jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/api/client', () => ({ __esModule: true, default: { post: jest.fn() } }));

describe('NewTimer page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders form fields', () => {
    render(<NewTimer />);
    expect(screen.getByText('New Countdown')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Product Launch')).toBeInTheDocument();
    expect(screen.getByText('Create Countdown')).toBeInTheDocument();
  });

  it('shows error when title is empty', async () => {
    render(<NewTimer />);
    fireEvent.click(screen.getByText('Create Countdown'));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('submits valid form', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 1, title: 'Test', duration_seconds: 60, end_time: null, status: 'idle', created_at: '2025-01-01' } });
    render(<NewTimer />);
    fireEvent.change(screen.getByPlaceholderText('e.g. Product Launch'), { target: { value: 'Test' } });
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '1' } }); // minutes
    fireEvent.click(screen.getByText('Create Countdown'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/timers', { title: 'Test', duration_seconds: 60 }));
  });
});