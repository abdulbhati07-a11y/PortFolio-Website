import { expect, test } from '@playwright/test';

test('The cat wakes on every click and releases individual floating meows', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  const cat = page.getByRole('button', { name: 'Pet the cat', exact: true });
  await cat.click();
  const room = page.locator('.desk-scene');
  await expect(room).toHaveAttribute('data-cat-pets', '1');
  await expect(room).toHaveAttribute('data-cat-awake', 'true');
  await expect(page.getByRole('status', { name: 'Cat reaction' })).toContainText('Meow');
  await cat.click();
  await expect(room).toHaveAttribute('data-cat-pets', '2');
  const words = page.locator('.cat-meow');
  await expect(words).toHaveCount(2);
  await expect(words.first()).toHaveText('meow');
  const top = (await words.last().boundingBox())!.y;
  await expect.poll(async () => (await words.last().boundingBox())?.y, { timeout: 1200 }).toBeLessThan(top);
  await expect(words).toHaveCount(0, { timeout: 4000 });
  await expect(room).toHaveAttribute('data-cat-awake', 'false');
  await expect(page.getByRole('status', { name: 'Cat reaction' })).toContainText('falls asleep');
  await cat.focus();
  await page.keyboard.press('Enter');
  await expect(room).toHaveAttribute('data-cat-pets', '3');
  await expect(words).toHaveCount(1);
  await page.locator('.room-index').getByRole('button', { name: /Projects/ }).click();
  await expect(page.getByLabel('Project desktop')).toBeVisible({ timeout: 15000 });
});
