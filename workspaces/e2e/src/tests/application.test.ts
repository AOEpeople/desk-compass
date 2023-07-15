import { expect, test } from "@playwright/test";
import { StartPage } from "../pages/StartPage";

test.describe("Application", async () => {
  test("should be visible", async ({ page }) => {
    const startPage = new StartPage(page);
    await startPage.goto();

    await expect(startPage.getNavigationBar()).toBeVisible();
    await expect(startPage.getMap()).toBeVisible();
  });
});
