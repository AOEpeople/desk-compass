import { fireEvent, render, screen } from '@testing-library/svelte';
import ResetViewButton from './ResetViewButton.svelte';
import { viewport } from '../ts/ViewportSingleton';

describe('ResetViewButton', () => {
  test('should be initialized', async () => {
    render(ResetViewButton);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should call viewport reset on click', async () => {
    render(ResetViewButton);

    await fireEvent.click(screen.getByRole('button'));

    expect(viewport.reset).toHaveBeenCalledTimes(1);
  });
});
