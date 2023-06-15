import { beforeEach, describe, expect, it } from 'vitest';
import { viewport } from './ViewportSingleton';
import { Grid } from './Grid';

describe('Grid', () => {
  const defaultSpacing = 10;
  const showOriginLabel = false;
  const redrawEvent = 'moveend resize';
  const hidden = false;
  const zoomSpacing = [
    { startZoomLevel: -3, endZoomLevel: -2, spacing: 200 },
    { startZoomLevel: -1, endZoomLevel: 0, spacing: 100 },
    { startZoomLevel: 0, endZoomLevel: 4, spacing: 50 },
  ];
  let grid;

  beforeEach(async () => {
    grid = new Grid({
      labelSteps: defaultSpacing,
      showOriginLabel: showOriginLabel,
      redrawEvent: redrawEvent,
      hidden: hidden,
      zoomSpacing: zoomSpacing,
    });
    grid.onAdd(viewport.getLeafletMap());
  });

  it('should be initialized with default values', () => {
    const defaultGrid = new Grid();
    defaultGrid.onAdd(viewport.getLeafletMap());

    expect(defaultGrid.options.labelSteps).toBe(100);
    expect(defaultGrid.options.showOriginLabel).toBe(true);
    expect(defaultGrid.options.redrawEvent).toBe('moveend');
    expect(defaultGrid.options.hidden).toBe(false);
    expect(defaultGrid.options.zoomSpacing).toEqual([]);
  });

  it('should show a hidden grid', () => {
    const hiddenGrid = new Grid({
      hidden: true,
      zoomSpacing: zoomSpacing,
    });
    hiddenGrid.onAdd(viewport.getLeafletMap());

    expect(hiddenGrid.options.hidden).toBe(true);

    hiddenGrid.show();

    expect(hiddenGrid.options.hidden).toBe(false);
  });

  it('should hide a visible grid', () => {
    const visibleGrid = new Grid({
      hidden: false,
      zoomSpacing: zoomSpacing,
    });
    visibleGrid.onAdd(viewport.getLeafletMap());

    expect(visibleGrid.options.hidden).toBe(false);

    visibleGrid.hide();

    expect(visibleGrid.options.hidden).toBe(true);
  });
});
