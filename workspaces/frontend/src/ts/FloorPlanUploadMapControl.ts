import * as L from 'leaflet';
import FloorPlanUploadButton from '../components/FloorPlanUploadButton.svelte';
import { ImageOverlay } from 'leaflet';

export class FloorPlanUploadMapControl extends L.Control {
  _uploadButton: FloorPlanUploadButton;
  imageOverlay: ImageOverlay;

  options: L.ControlOptions = {
    position: 'bottomleft',
  };

  constructor(imageOverlay: ImageOverlay, options?: L.ControlOptions) {
    super(options);
    this.imageOverlay = imageOverlay;
    L.Util.setOptions(this, options);
  }

  onAdd(map) {
    const container = L.DomUtil.create('div');
    container.className = 'leaflet-bar leaflet-control hidden md:block';
    this._uploadButton = new FloorPlanUploadButton({
      target: container,
      props: {
        targetImageOverlay: this.imageOverlay,
      },
    });

    return container;
  }

  onRemove() {
    if (this._uploadButton) {
      this._uploadButton.$destroy();
      this._uploadButton = null;
    }
  }
}
