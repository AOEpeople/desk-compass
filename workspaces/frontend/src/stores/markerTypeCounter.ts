import { derived } from "svelte/store";
import { visibleMarkers } from "./visibleMarkers";
import { markerTypeStore } from "./markerTypes";
import { generateMarkerTypeTableWithDefaultValue, type MarkerTypeTable } from "../ts/MarkerTypeTable";

export const markerTypeCounter = derived([visibleMarkers, markerTypeStore], ([$visibleMarkers, $markerTypeStore]) => {
    const counterLookup: MarkerTypeTable<number> = generateMarkerTypeTableWithDefaultValue<number>(0);
    if (!$visibleMarkers) {
      return counterLookup;
    }
    $markerTypeStore.forEach((markerType) => {
      counterLookup[markerType.id] = $visibleMarkers.filter((m) => m.markerType.id === markerType.id).length;
    });
    return counterLookup;
  });
