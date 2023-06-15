import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import type { ImageDimensions } from '../ts/ImageDimensions';
import { viewport } from '../ts/ViewportSingleton';
import FloorPlanPaneSideBar from './FloorPlanPaneSideBar.svelte';

describe('FloorPlanPaneSideBar', () => {
  it('should be initialized', async () => {
    render(FloorPlanPaneSideBar);

    expect(screen.getByTestId('floorPlanPane')).toBeInTheDocument();
    expect(screen.getByTestId('floorPlanPane-form')).toBeInTheDocument();
  });

  describe('initialized with a marker', () => {
    beforeEach(async () => {
      viewport.getImageDimensions = vi.fn(() => {
        return { width: 100, height: 200 } as ImageDimensions;
      });

      render(FloorPlanPaneSideBar);

      fireEvent(document, new CustomEvent('floorplan', { detail: { action: 'open' } }));
    });

    it('should display image dimensions', async () => {
      expect(screen.getByTestId('floorPlanPane-dimensions')).toBeInTheDocument();
      expect(screen.getByTestId('floorPlanPane-dimensions').textContent).toEqual('100 x 200');
    });
  });
});
