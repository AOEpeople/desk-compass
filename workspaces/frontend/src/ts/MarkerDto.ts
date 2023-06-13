import type { Marker } from './Marker';

type MarkerDtoFromMarker = Omit<Marker, 'mapMarker' | 'markerType' | 'iconType' | 'getDto' | 'zIndex'>;
export type MarkerDto = MarkerDtoFromMarker & {
  type: string;
  icon: string;
};

export const toMarkerDto = (marker: Marker): MarkerDto => {
  const item = {
    id: marker.id,
    lat: marker.lat,
    lng: marker.lng,
    name: marker.name,
    image: marker.image,
    type: marker.markerType.id,
    rotation: marker.rotation,
    icon: marker.iconType.name,
    attributes: {},
  };

  if (marker.attributes) {
    marker.markerType.allowedAttributes.forEach((allowedAttr) => {
      if (marker.attributes[allowedAttr.name]) {
        item.attributes[allowedAttr.name] = marker.attributes[allowedAttr.name];
      }
    });
  }

  return item as MarkerDto;
};
