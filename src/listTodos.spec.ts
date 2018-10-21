import { Browser } from 'puppeteer';
import { resolve } from 'path';

import { getBrowser, initialize, screenshot, setupEnvironment } from './util';

let browser: Browser;

jest.setTimeout(10000);

beforeEach(async () => {
  setupEnvironment();
  browser = await getBrowser();
});

afterEach(async () => await browser.close());

describe('list todos', () => {
  test('loads', async () => {
    const { TEST_URL } = process.env;

    const page = await initialize(browser, TEST_URL);

    await page.waitForSelector('div[data-test-id]');
    const todos = await page.$$('div[data-test-id]');

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todos-list.png')
    );

    expect(todos.length).not.toBe(0);
  });
});
