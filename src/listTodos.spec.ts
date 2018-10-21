import { resolve } from 'path';
import puppeteer from 'puppeteer';

import { getBrowser, openApp, screenshot, setupEnvironment } from './util';

let browser: puppeteer.Browser;

jest.setTimeout(10000);

beforeAll(async () => {
  setupEnvironment();
  browser = await getBrowser();
});

afterAll(async () => browser.close());

describe('list todos', () => {
  test('loads', async () => {
    const { TEST_URL } = process.env;

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('div[data-test-id]');
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todos-list.png')
    );
    await page.close();
  });
});
