import { resolve } from 'path';

import { firestore } from 'firebase';
import puppeteer from 'puppeteer';

import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getBrowser,
  getFirestore,
  initFirebase,
  openApp,
  screenshot,
  setupEnvironment
} from './util';

let browser: puppeteer.Browser;
let todo: firestore.DocumentReference;

jest.setTimeout(10000);

beforeAll(async () => {
  setupEnvironment();
  await initFirebase();
  todo = await createTodo('test todo');
  browser = await getBrowser();
});

afterAll(async () => {
  await deleteTodo(todo.id);
  const firestoreDb = getFirestore();
  await firestoreDb.disableNetwork();
  return browser.close();
});

describe('list todos', () => {
  test('loads [@todoslist, @readonly]', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('[data-test-id="loading-snackbar"');
    await page.waitForSelector('div[data-test-id]');
    const todosDisplayed = await page.$$('div[data-test-id]');
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todos-list.png')
    );

    expect(todosDisplayed).toHaveLength(todos.length);
    await page.close();
  });

  test('only shows open todos when toggled [@todoslist, @readonly]', async () => {
    const { TEST_URL } = process.env;
    const filteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('[data-test-id="loading-snackbar"');
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

describe('todo', () => {
  test('marks itself done [@todo]', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await page.waitForSelector('div[data-test-id]');
    await page.click(`[data-test-id="${todo.id}-mark-done"]`);
    await page.waitForSelector('[data-test-id="loading-snackbar"');
    await screenshot(page, resolve(process.cwd(), './artifacts/todo-done.png'));

    // expect(todosDisplayed).toHaveLength(todos.length);
    await page.close();
  });
});
