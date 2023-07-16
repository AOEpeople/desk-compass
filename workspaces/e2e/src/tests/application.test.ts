import { expect, test } from "../fixtures";
import { StartPage } from "../pages/StartPage";

test.describe("Application", async () => {
  test("should be visible with some markers", async ({ startPage }) => {
    await expect(startPage.getNavigationBar()).toBeVisible();
    expect(await startPage.getMap().isVisible()).toBe(true);

    await startPage.getMap().markers().first().waitFor();
    await expect(await startPage.getMap().markers()).toHaveCount(5);
  });

  test("should load a specific marker", async ({ page }) => {
    await page.goto(
      `http://localhost:${process.env.APP_PORT}/#/markers/d01e096f-dd0b-4f49-943c-1b4e50133501`
    );
    const startPage = new StartPage(page);

    await startPage.getMap().markers().first().waitFor();
    const map = startPage.getMap();
    await expect(map.markerWithTooltip("John Doe")).toBeInViewport();
    await expect(map.markerWithTooltip("Jennifer Jarsen")).not.toBeInViewport();
  });

  test("should load a specific position in map", async ({ page }) => {
    await page.goto(
      `http://localhost:${process.env.APP_PORT}/#/coords/615.5/1065/0`
    );
    const startPage = new StartPage(page);

    await startPage.getMap().markers().first().waitFor();
    const map = startPage.getMap();
    await expect(map.markerWithTooltip("John Doe")).not.toBeInViewport();
    await expect(map.markerWithTooltip("Jennifer Jarsen")).toBeInViewport();
    await expect(map.markerWithTooltip("2nd floor")).toBeInViewport();
  });
});
