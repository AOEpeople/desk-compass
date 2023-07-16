import { test as base } from "@playwright/test";
import { StartPage } from "./pages/StartPage";
import { promises as p } from "fs";

type allFixtures = {
  startPage: StartPage;
};

export const test = base.extend<allFixtures>({
  startPage: async ({ page }, use) => {
    // reset database
    await p.cp("src/data-presets/data_preset.json", "test-data/data.json");
    await p.cp("src/data-presets/images/", "test-data/images/", {
      recursive: true,
    });

    // create start page
    const startPage = new StartPage(page);
    await startPage.goto();
    await use(startPage);
  },
});
export { expect } from "@playwright/test";
