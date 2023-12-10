import { viewport, viewportInitialized } from "../ts/ViewportSingleton";
import { derived } from "svelte/store";
import { markerFilter, markerStore, markerTypeTooltips, markerTypeVisibility } from "./markers";
import type { Marker } from "src/ts/Marker";

export const visibleMarkers = derived(
    [viewportInitialized, markerStore, markerFilter, markerTypeVisibility, markerTypeTooltips],
    ([$viewportInitialized, $markerStore, $markerFilter, $markerTypeVisibility, $markerTypeTooltips]) => {
      if (!$viewportInitialized) {
        return;
      }
  
      viewport.clearLayers();
      $markerStore.forEach((marker: Marker) => {
        // set visibility
        const shouldBeVisible =
          $markerTypeVisibility[marker.markerType.id] &&
          (!$markerFilter || $markerFilter === '' || marker.name.toLowerCase().indexOf($markerFilter.toLowerCase()) >= 0);
        if (shouldBeVisible && !viewport.hasLayer(marker.mapMarker)) {
          viewport.addLayer(marker.mapMarker);
        }
        if (!shouldBeVisible && viewport.hasLayer(marker.mapMarker)) {
          viewport.removeLayer(marker.mapMarker);
        }
  
        // Show/hide tooltip
        const shouldShowTooltip = $markerTypeTooltips[marker.markerType.id] && marker.name;
        if (shouldShowTooltip) {
          marker.mapMarker.openTooltip();
        } else {
          marker.mapMarker.closeTooltip();
        }
  
        // Highlight keyword in tooltip
        if (shouldShowTooltip && $markerFilter.length >= 2 && marker.name.toLowerCase().indexOf($markerFilter.toLowerCase()) >= 0) {
          marker.mapMarker.getTooltip()?.setContent(marker.name.replaceAll(new RegExp(`(${$markerFilter})`, 'ig'), `<mark>$1</mark>`));
        } else {
          marker.mapMarker.getTooltip()?.setContent(marker.name);
        }
      });
  
      return $markerStore.filter((m) => viewport?.hasLayer(m.mapMarker));
    }
  );
