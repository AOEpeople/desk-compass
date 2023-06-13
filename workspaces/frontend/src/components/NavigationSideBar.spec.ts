import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, test, vi } from 'vitest';
import { get } from 'svelte/store';
import { markerStore, markerTypeTooltips, markerTypeVisibility } from '../stores/markers';
import { viewport, viewportInitialized } from '../ts/ViewportSingleton';
import NavigationSideBar from './NavigationSideBar.svelte';
import { markerTypeStore } from '../stores/markerTypes';

describe('NavigationSideBar', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
    await markerStore.init();
    viewportInitialized.set(true);
  });

  test('should be initialized', async () => {
    render(NavigationSideBar);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('should search for markers', async () => {
    render(NavigationSideBar);

    const searchField = screen.getByPlaceholderText('Search');
    const removeLayerSpy = vi.spyOn(viewport, 'removeLayer');

    await fireEvent.input(searchField, { target: { value: 'Some' } });

    expect(removeLayerSpy).toHaveBeenCalledTimes(1);
  });

  test('should have rows for each marker type', async () => {
    render(NavigationSideBar);

    expect(screen.getByRole('button', { name: new RegExp('Table 0') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp('Person 1') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp('Room 1') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp('Toilet 0') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp('Emergency 0') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp('Other 0') })).toBeInTheDocument();
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

  describe('visibility', () => {
    test('should be enabled for all marker types', async () => {
      render(NavigationSideBar);

      get(markerTypeStore).forEach((markerType) => {
        const visibility = get(markerTypeVisibility)[markerType.id];
        expect(visibility).toBe(true);
      });
    });

    test('clicking button, should hide all markers of type', async () => {
      render(NavigationSideBar);

      const personButton = screen.getByRole('button', { name: new RegExp('^Person') });
      const removeLayerSpy = vi.spyOn(viewport, 'removeLayer');

      await fireEvent.click(personButton);

      // person markers invisible and actions deactivated
      const currentMarkerTypeVisibility = get(markerTypeVisibility);
      expect(currentMarkerTypeVisibility['person']).toBe(false);
      expect(screen.getByTitle('Toggle tooltips of Person markers')).toBeDisabled();
      expect(screen.getByTitle('Create new Person marker')).toBeDisabled();

      // others are still visible
      const markerTypeStoreContent = get(markerTypeStore);
      delete currentMarkerTypeVisibility['person'];
      Object.keys(currentMarkerTypeVisibility).forEach((markerType) => {
        expect(currentMarkerTypeVisibility[markerType]).toBe(true);
        const mType = markerTypeStoreContent.find((mt) => mt.id === markerType);
        if (markerType === 'Table') {
          expect(screen.getByTitle(`Toggle tooltips of ${mType.name} markers`)).toBeDisabled();
          expect(screen.getByTitle(`Create new ${mType.name} marker`)).toBeDisabled();
        } else {
          expect(screen.getByTitle(`Toggle tooltips of ${mType.name} markers`)).toBeEnabled();
          expect(screen.getByTitle(`Create new ${mType.name} marker`)).toBeEnabled();
        }
      });

      expect(removeLayerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('marker tooltips', () => {
    test('should be enabled for all marker types', async () => {
      render(NavigationSideBar);

      const currentMarkerTypeTooltips = get(markerTypeTooltips);
      expect(currentMarkerTypeTooltips['table']).toBe(false);
      expect(currentMarkerTypeTooltips['person']).toBe(true);
      expect(currentMarkerTypeTooltips['room']).toBe(true);
      expect(currentMarkerTypeTooltips['toilet']).toBe(false);
      expect(currentMarkerTypeTooltips['emergency']).toBe(true);
      expect(currentMarkerTypeTooltips['other']).toBe(false);
    });

    test('clicking button, should toggle visibility of tooltips for all markers of type', async () => {
      render(NavigationSideBar);

      const roomButton = screen.getByTitle('Toggle tooltips of Room markers');

      await fireEvent.click(roomButton);

      const currentMarkerTypeTooltips = get(markerTypeTooltips);
      expect(currentMarkerTypeTooltips['table']).toBe(false);
      expect(currentMarkerTypeTooltips['person']).toBe(true);
      expect(currentMarkerTypeTooltips['room']).toBe(false);
      expect(currentMarkerTypeTooltips['toilet']).toBe(false);
      expect(currentMarkerTypeTooltips['emergency']).toBe(true);
      expect(currentMarkerTypeTooltips['other']).toBe(false);
    });
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
