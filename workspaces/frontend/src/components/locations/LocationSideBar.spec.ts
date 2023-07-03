import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { currentLocation } from '../../stores/locations';
import { Location } from '../../ts/Location';
import LocationSideBar from './LocationSideBar.svelte';

describe('LocationSideBar', () => {
  const location = new Location({
    name: 'abc',
    shortName: 'def',
    description: 'ghi',
    width: 123,
    height: 456,
  });

  beforeEach(async () => {
    currentLocation.set(location);
  });

  it('should be initialized', async () => {
    render(LocationSideBar);

    expect(screen.getByTestId('floorPlanPane')).toBeInTheDocument();
    expect(screen.getByTestId('floorPlanPane-form')).toBeInTheDocument();
  });

  describe('initialized with a marker', () => {
    beforeEach(async () => {
      render(LocationSideBar);

      fireEvent(document, new CustomEvent('location', { detail: { action: 'select' } }));
    });

    it('should display image dimensions', async () => {
      expect(screen.getByTestId('floorPlanPane-dimensions')).toBeInTheDocument();
      expect(screen.getByDisplayValue(location.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(location.shortName)).toBeInTheDocument();
      expect(screen.getByDisplayValue(location.description)).toBeInTheDocument();
      expect(screen.getByTestId('floorPlanPane-dimensions').textContent).toEqual('123 x 456');
    });
  });
});
