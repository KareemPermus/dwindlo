import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

import AppLayout from '@/components/layout/AppLayout';

describe('AppLayout', () => {
  it('renders brand name and nav links', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('Dwindlo')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('My Timers')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});