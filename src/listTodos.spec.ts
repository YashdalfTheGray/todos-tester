import { resolve } from 'path';
import puppeteer from 'puppeteer';

import {
  getAllTodos,
  getBrowser,
  getFirestore,
  initFirebase,
  openApp,
  screenshot,
  setupEnvironment
} from './util';

let browser: puppeteer.Browser;

jest.setTimeout(10000);

beforeAll(async () => {
  setupEnvironment();
  await initFirebase();
  browser = await getBrowser();
});

afterAll(async () => {
  const firestore = await getFirestore();
  firestore.disableNetwork();
  return browser.close();
});

describe('list todos', () => {
  test('loads', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('div[data-test-id]');
    const todosDisplayed = await page.$$('div[data-test-id]');
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todos-list.png')
    );

    expect(todosDisplayed).toHaveLength(todos.length);
    await page.close();
  });

  test('only shows open todos when toggled', async () => {
    const { TEST_URL } = process.env;
    const filteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('div[data-test-id]');

    await page.click('[data-test-id="visibility-toggle"] input');
    const displayedTodos = await page.$$('div[data-test-id]');

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/open-todos-only.png')
    );

    expect(displayedTodos).toHaveLength(filteredTodos.length);
    await page.close();
  });
});
