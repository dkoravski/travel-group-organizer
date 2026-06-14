import { expect, test, type Page } from "@playwright/test";

const seededUser = {
  email: "IvanD@gmail.com",
  password: "pass123",
};

async function signIn(page: Page) {
  await page.goto("/login?redirectTo=/dashboard");

  await expect(
    page.getByRole("heading", { name: "Вход в профила" }),
  ).toBeVisible();

  await page.getByLabel("Имейл").fill(seededUser.email);
  await page.getByLabel("Парола").fill(seededUser.password);

  await Promise.all([
    page.waitForURL(/\/dashboard$/, { timeout: 15000 }),
    page.getByRole("button", { name: "Вход" }).click(),
  ]);
}

test("seeded user can log in and see the dashboard", async ({ page }) => {
  await signIn(page);

  await expect(page.getByRole("heading", { name: "Моето табло" })).toBeVisible({
    timeout: 15000,
  });
  const quickActions = page.getByRole("region", { name: "Бързи действия" });

  await expect(
    quickActions.getByRole("link", { name: "Мениджърски панел" }),
  ).toBeVisible();
  await expect(
    quickActions.getByRole("link", { name: "Създай пътуване" }),
  ).toBeVisible();
  await expect(page.getByText("Weekend Travelers")).toBeVisible();
  await expect(page.getByText("City Break Crew")).toBeVisible();
});

test("dashboard cards can open a seeded trip", async ({ page }) => {
  await signIn(page);

  const tripLink = page.locator('a[aria-label="Отвори пътуване Budapest Thermal Baths"]');

  await expect(tripLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/trips\/\d+\?from=dashboard$/),
    tripLink.click(),
  ]);

  await expect(page.getByRole("heading", { name: "Budapest Thermal Baths" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("City Break Crew")).toBeVisible();
  await expect(page.getByText("Организатор: Георги Георгиев")).toBeVisible();
});

test("dashboard cards can open a seeded group", async ({ page }) => {
  await signIn(page);

  const groupCard = page.locator("article").filter({ hasText: "Weekend Travelers" });
  const groupLink = groupCard.getByRole("link", { name: "Виж групата" });

  await expect(groupLink).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/groups\/\d+\?from=dashboard$/),
    groupLink.click(),
  ]);

  await expect(page.getByRole("heading", { name: "Weekend Travelers" })).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByRole("heading", { name: "Членове на групата" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Пътувания на групата" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weekend in Thessaloniki" })).toBeVisible();
});