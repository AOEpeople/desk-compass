import { Locator, Page } from "@playwright/test";

export class Map {
  readonly page: Page;
  readonly locator: Locator;

  constructor(page: Page, locator: Locator) {
    this.page = page;
    this.locator = locator;
  }

  async isVisible(): Promise<boolean> {
    return await this.locator.isVisible();
  }

  markers(): Locator {
    return this.locator.locator(".leaflet-layer");
  }

  markerWithTooltip(markerName: string): Locator {
    return this.locator.getByRole("tooltip", { name: markerName });
  }
}
