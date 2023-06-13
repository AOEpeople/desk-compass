import { markerTypeStore } from '../stores/markerTypes';
import { toMarkerDto } from './MarkerDto';
import { generateMarker } from './Marker';

describe('MarkerDto: toMarkerDto', () => {
  beforeEach(async () => {
    await markerTypeStore.init();
  });

  test('toMarkerDto', () => {
    const marker = generateMarker({
      id: 123,
      name: 'Test',
      lat: 12.34,
      lng: 56.78,
      type: 'person',
      icon: 'person',
      rotation: 270,
      attributes: {
        Skype: 'skype-link',
        UnknownProp: 'test',
      },
    });

    const dto = toMarkerDto(marker);

    expect(dto.id).toBe(123);
    expect(dto.name).toBe('Test');
    expect(dto.lat).toBe(12.34);
    expect(dto.lng).toBe(56.78);
    expect(dto.rotation).toBe(270);
    expect(dto.type).toBe('person');
    expect(dto.icon).toBe('person');
    expect(dto.attributes['Skype']).toBe('skype-link');
    expect(dto.attributes['UnknownProp']).not.toBeDefined();
  });
});
