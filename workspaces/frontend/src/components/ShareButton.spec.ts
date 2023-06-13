import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach } from 'vitest';
import ShareButton from './ShareButton.svelte';

describe('ShareButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {
          // mock
        },
      },
    });
  });

  test('should be initialized', async () => {
    render(ShareButton, {
      title: 'test123',
      text: 'This is some text',
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  describe('on click', () => {
    test('should copy text', async () => {
      navigator.clipboard.writeText = () =>
        new Promise((resolve) => {
          resolve();
        });
      const spy = vi.spyOn(navigator.clipboard, 'writeText');
      render(ShareButton, {
        title: 'test123',
        text: 'This is some text',
      });

      await fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        if (!document.querySelector('.click-success')) {
          throw new Error('Link class was not updated');
        }
        return true;
      });

      expect(spy).toHaveBeenCalled();
      expect(document.querySelector('.click-success')).not.toBeNull;

      // Removes transition class after one second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(document.querySelector('.click-success')).toBeNull;
    });

    test('should have an error', async () => {
      navigator.clipboard.writeText = () =>
        new Promise((_, reject) => {
          reject();
        });
      const spy = vi.spyOn(navigator.clipboard, 'writeText');
      render(ShareButton, {
        title: 'test123',
        text: 'This is some text',
      });

      await fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        if (!document.querySelector('.click-failed')) {
          throw new Error('Link class was not updated');
        }
        return true;
      });

      expect(spy).toHaveBeenCalled();
      expect(document.querySelector('.click-failed')).not.toBeNull;
    });
  });
});
