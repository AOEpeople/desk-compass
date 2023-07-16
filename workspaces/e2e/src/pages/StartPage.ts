import { Locator, Page } from "@playwright/test";
import { Map } from "./Map";
import { NavigationBar } from "./NavigationBar";

export class StartPage {
  readonly page: Page;
  readonly navigationBar: Locator;
  readonly map: Locator;
  readonly locationSideBar: Locator;
  readonly markerSideBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigationBar = page.getByRole("navigation");
    this.map = page.locator("#mapContainer");
    this.locationSideBar = page.getByTestId("floorPlanPane");
    this.markerSideBar = page.getByTestId("infoPane");
  }

  async goto() {
    await this.page.goto(`http://localhost:${process.env.APP_PORT}`);
  }

  getNavigationBar(): NavigationBar {
    return new NavigationBar(this.page, this.navigationBar);
  }

  getMap(): Map {
    return new Map(this.page, this.map);
  }
}
