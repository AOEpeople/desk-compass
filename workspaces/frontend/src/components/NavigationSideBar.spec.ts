import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { get } from 'svelte/store';
import { locationStore } from '../stores/locations';
import { markerTypeStore } from '../stores/markerTypes';
import { markerStore } from '../stores/markers';
import { viewport, viewportInitialized } from '../ts/ViewportSingleton';
import NavigationSideBar from './NavigationSideBar.svelte';

describe('NavigationSideBar', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
    await locationStore.init();
    await markerStore.init();
    viewportInitialized.set(true);
  });

  test('should be initialized', async () => {
    render(NavigationSideBar);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('should be collapsible/expandable', async () => {
    render(NavigationSideBar);

    expect(screen.getByRole('button', { name: 'chevron_left' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'chevron_right' })).not.toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'chevron_left' }));

    expect(screen.queryByRole('button', { name: 'Collapse' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'chevron_right' })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole('button', { name: 'chevron_right' }));

    expect(screen.getByRole('button', { name: 'chevron_left' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'chevron_right' })).not.toBeInTheDocument();
  });

  describe('create marker', () => {
    test('clicking button should create a new marker', async () => {
      render(NavigationSideBar);

      const markerCountBeforeCreation = get(markerStore).length;
      const createFirstAidKitButton = screen.getByTitle('Create new Emergency marker');
      const getCenterSpy = vi.spyOn(viewport, 'getCenter');

      await fireEvent.click(createFirstAidKitButton);
      await waitFor(() => {
        return get(markerStore).length === markerCountBeforeCreation + 1;
      });
      expect(getCenterSpy).toHaveBeenCalledTimes(1);
    });
  });
});
