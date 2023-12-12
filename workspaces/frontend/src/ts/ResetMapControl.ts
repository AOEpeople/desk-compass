import * as L from 'leaflet';
import ResetViewButton from '../components/ResetViewButton.svelte';

export class ResetMapControl extends L.Control {
  _resetViewButton: ResetViewButton;

  options: L.ControlOptions = {
    position: 'bottomright',
  };

  constructor(options?: L.ControlOptions) {
    super(options);
    L.Util.setOptions(this, options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAdd(map) {
    const container = L.DomUtil.create('div');
    container.className = 'leaflet-bar leaflet-control';

    this._resetViewButton = new ResetViewButton({
      target: container,
    });

    return container;
  }

  onRemove() {
    if (this._resetViewButton) {
      this._resetViewButton.$destroy();
      this._resetViewButton = null;
    }
  }
}
