import { expect, test } from "../fixtures";
import { StartPage } from "../pages/StartPage";

test.describe("Application", async () => {
  test("should be visible with some markers", async ({ startPage }) => {
    // check map
    await expect(startPage.map).toBeVisible();
    await startPage.getMap().markers().first().waitFor();
    await expect(await startPage.getMap().markers()).toHaveCount(1);

    // check navigation
    await expect(startPage.navigationBar).toBeVisible();
    expect(await startPage.getNavigationBar().activeLocation()).toEqual(
      "2nd floor",
    );
    await Promise.all(
      [
        "Table 0",
        "Person 0",
        "Room 1",
        "Toilet 0",
        "Emergency 0",
        "Other 0",
      ].map(async (markerType) => {
        await expect(
          startPage.getNavigationBar().markerTypes().getByText(markerType),
        ).toBeVisible();
      }),
    );
  });

  test("should load a specific location and marker", async ({ page }) => {
    await page.goto(
      `http://localhost:${process.env.APP_PORT}/#/locations/9a6494b1-be0b-4e36-aad2-fb6588171632/markers/d01e096f-dd0b-4f49-943c-1b4e50133501`,
    );
    const startPage = new StartPage(page);

    // check map
    await startPage.getMap().markers().first().waitFor();
    const map = startPage.getMap();
    await expect(await startPage.getMap().markers()).toHaveCount(6);
    await expect(map.markerWithTooltip("John Doe")).toBeInViewport();
    await expect(map.markerWithTooltip("Jennifer Jarsen")).not.toBeInViewport();

    // check navigation
    await expect(startPage.navigationBar).toBeVisible();
    expect(await startPage.getNavigationBar().activeLocation()).toEqual(
      "Ground",
    );
    await Promise.all(
      [
        "Table 1",
        "Person 1",
        "Room 0",
        "Toilet 2",
        "Emergency 1",
        "Other 1",
      ].map(async (markerType) => {
        await expect(
          startPage.getNavigationBar().markerTypes().getByText(markerType),
        ).toBeVisible();
      }),
    );
  });

  test("should load a specific position in map", async ({ page }) => {
    await page.goto(
      `http://localhost:${process.env.APP_PORT}/#/locations/979f806c-297a-4c99-88db-2363a34dba38/coords/615.5/1065/0`,
    );
    const startPage = new StartPage(page);

    await startPage.getMap().markers().first().waitFor();
    const map = startPage.getMap();
    await expect(await startPage.getMap().markers()).toHaveCount(2);
    await expect(map.markerWithTooltip("John Doe")).not.toBeInViewport();
    await expect(map.markerWithTooltip("Jennifer Jarsen")).toBeInViewport();

    // check navigation
    await expect(startPage.navigationBar).toBeVisible();
    expect(await startPage.getNavigationBar().activeLocation()).toEqual(
      "1st floor",
    );
    await Promise.all(
      [
        "Table 1",
        "Person 1",
        "Room 0",
        "Toilet 0",
        "Emergency 0",
        "Other 0",
      ].map(async (markerType) => {
        await expect(
          startPage.getNavigationBar().markerTypes().getByText(markerType),
        ).toBeVisible();
      }),
    );
  });
});
