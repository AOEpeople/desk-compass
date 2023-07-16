import { Locator, Page } from "@playwright/test";

export class NavigationBar {
  readonly page: Page;
  readonly locator: Locator;

  constructor(page: Page, locator: Locator) {
    this.page = page;
    this.locator = locator;
  }

  locations(): Locator {
    return this.locator.getByTestId("nav-locations").locator(".nav-item");
  }

  activeLocation(): Promise<string> {
    return this.locator
      .getByTestId("nav-locations")
      .locator(".nav-item--active")
      .getByTestId("nav-item-title")
      .textContent();
  }

  markerTypes(): Locator {
    return this.locator.getByTestId("nav-markerTypes").locator(".nav-item");
  }
}
