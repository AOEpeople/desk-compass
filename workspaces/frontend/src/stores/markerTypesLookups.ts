import { derived } from 'svelte/store';
import type { MarkerTypeTable } from '../ts/MarkerTypeTable';
import { viewportInitialized } from '../ts/ViewportSingleton';
import { generateMarkerTypeTableFromProperty } from '../ts/MarkerTypeTable';
import { markerTypeTooltips, markerTypeVisibility } from './markers';
import { markerTypeStore } from './markerTypes';

// update markerTypeLookups
derived([viewportInitialized, markerTypeStore], ([$viewportInitialized, $markerTypeStore]) => {
  if (!$viewportInitialized) {
    return;
  }

  markerTypeVisibility.update((mTypeTable: MarkerTypeTable<boolean>) => {
    const newMarkerTypeList = generateMarkerTypeTableFromProperty<boolean>('visibleByDefault');
    $markerTypeStore.forEach((mType) => {
      if (mTypeTable[mType.id]) {
        newMarkerTypeList[mType.id] = mTypeTable[mType.id];
      }
    });
    return newMarkerTypeList;
  });

  markerTypeTooltips.update((mTypeTable: MarkerTypeTable<boolean>) => {
    const newMarkerTypeList = generateMarkerTypeTableFromProperty<boolean>('labelShownByDefault');
    $markerTypeStore.forEach((mType) => {
      if (mTypeTable[mType.id]) {
        newMarkerTypeList[mType.id] = mTypeTable[mType.id];
      }
    });
    return newMarkerTypeList;
  });
}).subscribe(() => {
  // nothing to do
});