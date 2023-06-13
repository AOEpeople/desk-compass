import * as L from 'leaflet';
import ShareButton from '../components/ShareButton.svelte';

export class ShareMapControl extends L.Control {
  _shareMapButton: ShareButton;

  options: L.ControlOptions = {
    position: 'bottomright',
  };

  constructor(options?: L.ControlOptions) {
    super(options);
    L.Util.setOptions(this, options);
  }

  _getText(map: L.Map) {
    return (
      `${window.location.host}${window.location.pathname}#/coords/` +
      `${map?.getBounds()?.getCenter().lat}/${map?.getBounds()?.getCenter().lng}/${map?.getZoom()}`
    );
  }

  onAdd(map: L.Map): HTMLElement {
    const container = L.DomUtil.create('div');
    container.className = 'leaflet-bar leaflet-control';

    this._shareMapButton = new ShareButton({
      target: container,
      props: {
        text: () => this._getText(map),
      },
    });

    return container;
  }

  onRemove() {
    if (this._shareMapButton) {
      this._shareMapButton.$destroy();
      this._shareMapButton = null;
    }
  }
}
