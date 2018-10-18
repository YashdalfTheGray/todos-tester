import { Browser } from 'puppeteer';
import { resolve } from 'path';
import * as faker from 'faker';

import { getBrowser, initialize, screenshot } from './util';

let browser: Browser;

beforeEach(async () => {
  browser = await getBrowser();
});

afterEach(() => browser.close());

describe('list todos', () => {
  test('loads', async () => {
    const page = await initialize(browser);

    await page.waitForSelector('div[data-test-id]');
    const todos = await page.$$('div[data-test-id]');

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todos-list.png')
    );

    expect(todos.length).not.toBe(0);
  });
});
