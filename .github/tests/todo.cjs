const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(resolve('todo/index.html')).href);
    const input = page.locator('#todo-input');
    const items = page.locator('#todo-list li');

    await input.fill('  First task  ');
    await page.getByRole('button', { name: 'Add task' }).click();
    assert.equal(await items.count(), 1);
    assert.match(await items.first().innerText(), /First task/);

    await input.fill('Second task');
    await page.getByRole('button', { name: 'Add task' }).click();
    assert.equal(await items.count(), 2);

    await items.first().getByRole('button', { name: /edit/i }).click();
    await page.getByRole('textbox', { name: 'Edit task' }).fill('Updated task');
    await page.getByRole('button', { name: 'Save' }).click();
    assert.match(await items.first().innerText(), /Updated task/);

    await input.fill('   ');
    await page.getByRole('button', { name: 'Add task' }).click();
    assert.equal(await items.count(), 2);

    await items.first().getByRole('button', { name: /delete/i }).click();
    assert.equal(await items.count(), 1);
    assert.match(await items.first().innerText(), /Second task/);
    await items.first().getByRole('button', { name: /delete/i }).click();
    assert.equal(await items.count(), 0);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
