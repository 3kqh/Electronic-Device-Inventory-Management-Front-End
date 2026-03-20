import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Notification, { showNotification } from './Notification';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('renders nothing when no notification has been triggered', () => {
  const { container } = render(<Notification />);
  expect(container.firstChild).toBeNull();
});

test('displays a success notification with correct message and styling', () => {
  render(<Notification />);

  act(() => {
    showNotification({ type: 'success', message: 'Thành công!' });
  });

  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Thành công!');
  expect(alert).toHaveAttribute('data-type', 'success');
  expect(alert.style.color).toBe('rgb(46, 125, 50)'); // #2e7d32
});

test('displays an error notification with correct message and styling', () => {
  render(<Notification />);

  act(() => {
    showNotification({ type: 'error', message: 'Lỗi xảy ra' });
  });

  const alert = screen.getByRole('alert');
  expect(alert).toHaveTextContent('Lỗi xảy ra');
  expect(alert).toHaveAttribute('data-type', 'error');
  expect(alert.style.color).toBe('rgb(198, 40, 40)'); // #c62828
});

test('auto-dismisses after 3 seconds', async () => {
  render(<Notification />);

  act(() => {
    showNotification({ type: 'success', message: 'Tạm biệt' });
  });

  expect(screen.getByRole('alert')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('replaces previous notification when a new one is triggered', () => {
  render(<Notification />);

  act(() => {
    showNotification({ type: 'success', message: 'First' });
  });
  expect(screen.getByRole('alert')).toHaveTextContent('First');

  act(() => {
    showNotification({ type: 'error', message: 'Second' });
  });
  expect(screen.getByRole('alert')).toHaveTextContent('Second');
  expect(screen.getByRole('alert')).toHaveAttribute('data-type', 'error');
});
