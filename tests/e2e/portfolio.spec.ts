import { expect, test } from '@playwright/test';

test('Flat route contains all four destinations and working filters', async ({ page }) => {
  await page.goto('/flat');
  for (const section of ['projects', 'journey', 'about', 'contact']) await expect(page.locator('#' + section)).toBeVisible();
  await page.getByRole('button', { name: 'Python', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'QR Code Generator' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Drink Water Reminder' })).toBeVisible();
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('button', { name: 'Next →' }).click();
  await expect(page.getByRole('heading', { name: 'QR Code Generator' })).toBeVisible();
  for (const [category, count] of [['AI', 3], ['Data science', 2], ['Web', 4], ['Python', 2]] as const) {
    await page.getByRole('button', { name: category, exact: true }).click();
    await expect(page.locator('.flat-project')).toHaveCount(count);
  }
});

test('Project case study has evidence links and back navigation', async ({ page }) => {
  await page.goto('/projects/vision-guard');
  await expect(page.getByRole('heading', { name: 'VisionGuard' })).toBeVisible();
  await expect(page.getByText(/Evaluation and deployment claims are pending evidence review/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'View source' })).toHaveCount(0);
  await page.getByRole('link', { name: 'All projects' }).click();
  await expect(page).toHaveURL(/\/flat#projects/);
});

test('Cinematic opening moves from the bot close-up into the lit room', async ({ page }) => {
  test.setTimeout(45000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await expect(page.locator('.immersive-shell')).toHaveAttribute('data-intro-stage', 'name');
  await expect(page.getByText('MUHAMMAD ABDULLAH BHATTI / DEVELOPER')).toBeVisible();
  await expect(page.locator('.immersive-shell')).toHaveAttribute('data-intro-stage', 'bot', { timeout: 7000 });
  await expect(page.locator('.immersive-shell')).toHaveAttribute('data-intro-stage', 'reveal', { timeout: 7000 });
  await expect(page.locator('.immersive-shell')).toHaveAttribute('data-intro-stage', 'ready', { timeout: 10000 });
  await expect(page.getByRole('navigation', { name: 'Room destinations' })).toBeVisible();
});

test('Room opens all four destinations and Escape returns home', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  for (const label of ['PROJECTS', 'JOURNEY', 'ABOUT', 'CONTACT']) {
    await page.locator('.scene-dock button').filter({ hasText: label }).click();
    await expect(page.getByRole('dialog', { name: label.toLowerCase() + ' window' })).toBeVisible({ timeout: 15000 });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: label.toLowerCase() + ' window' })).toHaveCount(0);
  }
});

test('Room previews open on click and the desk bot opens portfolio chat', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await page.locator('.object-label.projects').hover();
  await expect(page.getByLabel('Projects preview')).toHaveCount(0);
  await page.locator('.object-label.projects').click();
  await expect(page.getByLabel('Projects preview')).toBeVisible();
  await expect(page.getByLabel('Projects preview').locator('img')).toBeVisible();
  await page.getByRole('button', { name: 'Close preview' }).click();
  await expect(page.getByLabel('Projects preview')).toHaveCount(0);
  await page.locator('.object-label.assistant').click();
  await expect(page.getByLabel('Portfolio assistant')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your question' })).toBeFocused();
});

test('WebGL failure exposes complete Flat route', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return original.call(this, type, ...args);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto('/');
  await expect(page.getByText('The room is unavailable')).toBeVisible();
  await page.getByRole('link', { name: 'Open the full Flat portfolio' }).click();
  await expect(page).toHaveURL(/\/flat/);
});

test('Portfolio chat answers verified facts and declines unknown claims', async ({ page }) => {
  await page.goto('/flat');
  await page.getByRole('button', { name: 'Open portfolio assistant' }).click();
  await page.getByRole('textbox', { name: 'Your question' }).fill('What university does Abdullah attend?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.chat-bubble.assistant').last()).toContainText('University of Management and Technology, Lahore');
  await page.getByRole('textbox', { name: 'Your question' }).fill('What is the GPA?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.chat-bubble.assistant').last()).toContainText('do not have verified portfolio information');
});

test('Mobile Flat layout fits the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/flat');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});

test('Contact validates inputs and reports delivery state honestly', async ({ page }) => {
  await page.goto('/flat');
  const form = page.locator('.contact-form');
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.locator('input[name="name"]')).toHaveAttribute('required', '');
  await form.locator('input[name="name"]').fill('Test Visitor');
  await form.locator('input[name="email"]').fill('test@example.com');
  await form.locator('textarea[name="message"]').fill('A message long enough for validation.');
  await page.route('**/api/contact', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"sent":true}' }));
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(form.getByRole('status')).toContainText('Message sent');
});

test('Chat renders streamed response chunks', async ({ page }) => {
  await page.goto('/flat');
  await page.route('**/api/chat', (route) => route.fulfill({ status: 200, contentType: 'text/plain', body: 'The portfolio includes Python and data science projects.' }));
  await page.getByRole('button', { name: 'Open portfolio assistant' }).click();
  await page.getByRole('textbox', { name: 'Your question' }).fill('What does Abdullah build?');
  await page.getByRole('button', { name: 'Send question' }).click();
  await expect(page.locator('.chat-bubble.assistant')).toContainText('Python and data science projects');
});

test('Mobile room keeps all destinations usable with arrow and Escape keys', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('dialog', { name: 'contact window' })).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'contact window' })).toHaveCount(0);
  await page.locator('.scene-dock button').filter({ hasText: 'PROJECTS' }).click();
  await expect(page.getByRole('dialog', { name: 'projects window' })).toBeVisible({ timeout: 15000 });
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
});
