import { fireEvent, render, screen } from '@testing-library/svelte';
import { vi } from 'vitest';
import { get } from 'svelte/store';
import { markerStore } from '../stores/markers';
import { viewport } from '../ts/ViewportSingleton';
import InfoPaneSideBar from './InfoPaneSideBar.svelte';
import { markerTypeStore } from '../stores/markerTypes';

describe('InfoPaneSideBar', () => {
  test('should be initialized', async () => {
    render(InfoPaneSideBar);

    expect(screen.getByTestId('infoPane')).toBeInTheDocument();
    expect(screen.queryByTestId('infoPane-marker')).not.toBeInTheDocument();
  });

  describe('initialized with a marker', () => {
    beforeEach(async () => {
      await markerTypeStore.init();
      await markerStore.init();
      const marker = get(markerStore)[1];
      marker.mapMarker.onAdd(viewport.getLeafletMap());

      render(InfoPaneSideBar);

      fireEvent(document, new CustomEvent('marker', { detail: { action: 'select', marker: marker } }));
    });

    test('should display marker details', async () => {
      expect(screen.getByTestId('infoPane-marker')).toBeInTheDocument();
      expect(screen.getByTestId('infoPane-marker-Description-value')).toHaveTextContent('Some description');
      expect(screen.getByTestId('infoPane-marker-icon')).toHaveTextContent('bookable');

      expect(screen.getByTestId('infoPane-action-edit')).toBeInTheDocument();
      expect(screen.getByTestId('infoPane-action-delete')).toBeInTheDocument();
      expect(screen.getByTestId('infoPane-action-enable-dragging')).toBeInTheDocument();
    });

    describe('switch to edit mode', () => {
      beforeEach(async () => {
        await fireEvent.click(screen.getByTestId('infoPane-action-edit'));
      });

      test('should display different buttons', async () => {
        expect(screen.getByTestId('infoPane-action-save')).toBeInTheDocument();
        expect(screen.queryByTestId('infoPane-action-edit')).not.toBeInTheDocument();
        expect(screen.queryByTestId('infoPane-action-delete')).not.toBeInTheDocument();
        expect(screen.queryByTestId('infoPane-action-enable-dragging')).not.toBeInTheDocument();

        expect(screen.getByTestId('infoPane-marker-Description-value')).toHaveAttribute('contenteditable', 'true');
      });

      test('should be cancelable', async () => {
        await fireEvent.click(screen.getByTestId('infoPane-action-cancel'));

        expect(screen.queryByTestId('infoPane-action-save')).not.toBeInTheDocument();
        expect(screen.getByTestId('infoPane-action-edit')).toBeInTheDocument();
      });

      test('should update marker property', async () => {
        await fireEvent.input(screen.getByTestId('infoPane-marker-name'), { target: { innerText: 'CHANGED NAME' } });
        await fireEvent.change(screen.getByTestId('infoPane-marker-icon-edit'), { target: { value: 'public' } });
        await fireEvent.input(screen.getByTestId('infoPane-marker-Description-value'), { target: { innerText: 'CHANGED DESCRIPTION' } });
        await fireEvent.click(screen.getByTestId('infoPane-action-save'));

        expect(screen.queryByTestId('infoPane-action-save')).not.toBeInTheDocument();
        expect(screen.getByTestId('infoPane-action-edit')).toBeInTheDocument();
        expect(screen.getByTestId('infoPane-action-delete')).toBeInTheDocument();
        expect(screen.getByTestId('infoPane-action-enable-dragging')).toBeInTheDocument();

        expect(screen.getByTestId('infoPane-marker-name')).toHaveTextContent('CHANGED NAME');
        expect(screen.getByTestId('infoPane-marker-icon')).toHaveTextContent('public');
        expect(screen.getByTestId('infoPane-marker-Description-value')).toHaveTextContent('CHANGED DESCRIPTION');
      });
    });

    test('should copy marker url', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: () =>
            new Promise((resolve) => {
              resolve(true);
            }),
        },
      });
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText');

      await fireEvent.click(screen.getByTitle('Share link'));

      expect(clipboardSpy).toHaveBeenCalled();
    });

    test('should recenter marker', async () => {
      await fireEvent.click(screen.getByTitle('Recenter'));

      expect(viewport.invalidateSize).toHaveBeenCalledTimes(1);
      expect(viewport.flyTo).toHaveBeenCalledTimes(1);
    });

    test('should close', async () => {
      await fireEvent.click(screen.getByTitle('Close'));

      expect(screen.getByTestId('infoPane')).toBeInTheDocument();
      expect(screen.queryByTestId('infoPane-marker')).not.toBeInTheDocument();
    });

    test('should have delete button', () => {
      expect(screen.getByTestId('infoPane-action-delete')).toBeInTheDocument();
    });
  });
});
