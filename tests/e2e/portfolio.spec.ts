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

test('Room opens all four destinations and Escape returns home', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await expect(page.getByRole('status', { name: 'Welcome to Abdullah’s room' })).toBeVisible();
  await expect(page.locator('.room-index')).toBeHidden();
  await page.waitForTimeout(350); // Robot face is visible before the name card.
  await expect(page.locator('.room-intro-shade')).toHaveCSS('opacity', '0');
  await expect(page.locator('.room-intro-copy')).toHaveCSS('opacity', '0');
  await page.waitForTimeout(1000); // Keep the pullback visible, rather than covering it.
  await expect(page.locator('.room-intro-shade')).toHaveCSS('opacity', '0');
  await page.waitForTimeout(1400); // The following name card holds on black.
  await expect(page.locator('.room-intro-shade')).toHaveCSS('opacity', '1');
  await expect(page.locator('.room-intro-name')).toBeVisible();
  await expect(page.locator('.room-intro')).toHaveCount(0, { timeout: 12000 });
  for (const [label, surface] of [['Projects', 'Project desktop'], ['Experience', 'Learning, projects and credentials'], ['About', 'About Abdullah'], ['Contact', 'Contact Abdullah']]) {
    await page.locator('.room-index').getByRole('button', { name: new RegExp(label) }).click();
    await expect(page.locator('.room-surface[aria-label="' + surface + '"]')).toBeVisible({ timeout: 15000 });
    if (label === 'Contact') {
      await page.getByRole('button', { name: 'Open message form', exact: true }).click();
      const form = page.locator('dialog .contact-form');
      await form.locator('input[name="name"]').fill('Test Visitor');
      await form.locator('input[name="email"]').fill('test@example.com');
      await form.locator('textarea[name="message"]').fill('Testing the integrated room contact form.');
      await expect(form.locator('input[name="website"]')).toBeHidden();
      await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"sent":true}' }));
      await form.getByRole('button', { name: 'Send message' }).click();
      await expect(form.getByRole('status')).toContainText('Message sent');
      await page.keyboard.press('Escape');
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('.room-surface')).toHaveCount(0);
  }
});

test('Room project details and local guide use verified portfolio content', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.room-index').getByRole('button', { name: /Projects/ }).click();
  await page.locator('.project-tile').filter({ hasText: 'VisionGuard' }).click({ timeout: 15000 });
  await expect(page.locator('.case-readme')).toContainText('Evaluation and deployment claims are pending evidence review');
  await expect(page.locator('.case-links a')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.locator('.room-index').getByRole('button', { name: /About/ }).click();
  await page.getByRole('textbox', { name: 'Ask about Abdullah' }).fill('What university does Abdullah attend?');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('.tv-message.guide').last()).toContainText('University of Management and Technology, Lahore');
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

test('Mobile room navigation and Escape remain usable', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter without sound' }).click();
  await page.locator('.room-index').getByRole('button', { name: /Contact/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Contact Abdullah', { exact: true })).toBeVisible({ timeout: 15000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('.room-surface')).toHaveCount(0);
  await page.locator('.room-index').getByRole('button', { name: /Projects/ }).click();
  await expect(page.getByLabel('Project desktop')).toBeVisible({ timeout: 15000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
