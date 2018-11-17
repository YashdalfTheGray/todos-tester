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
  markTodoDone,
  markTodoUndone,
  openApp,
  screenshot,
  setupEnvironment,
  waitForNotLoading
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
    await waitForNotLoading(page);
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
    await waitForNotLoading(page);
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
    const prevFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.click(`[data-test-id="${todo.id}-mark-done"]`);
    await waitForNotLoading(page);
    await screenshot(page, resolve(process.cwd(), './artifacts/todo-done.png'));

    const currFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);
    expect(currFilteredTodos).toHaveLength(prevFilteredTodos.length - 1);
    await page.close();
    await markTodoUndone(todo.id);
  });

  test('marks itself undone [@todo]', async () => {
    const { TEST_URL } = process.env;
    const prevFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    await markTodoDone(todo.id);
    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector(`[data-test-id="${todo.id}-mark-undone"]`);
    await page.click(`[data-test-id="${todo.id}-mark-undone"]`);
    await waitForNotLoading(page);
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todo-undone.png')
    );

    const currFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);
    expect(currFilteredTodos).toHaveLength(prevFilteredTodos.length);
    await page.close();
  });

  test('can go into edit mode [@todo @readonly]', async () => {
    const { TEST_URL } = process.env;
    const prevFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector(`[data-test-id="${todo.id}-edit-todo"]`);
    await page.click(`[data-test-id="${todo.id}-edit-todo"]`);
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todo-edit-mode.png')
    );

    const todoHeading = await page.waitForSelector(
      `[data-test-id="${todo.id}-edit-content"]`
    );
    expect(todoHeading).toBeDefined();
    await page.close();
  });

  test.skip('can edit itself [@todo]', async () => {
    const { TEST_URL } = process.env;
    const prevFilteredTodos = (await getAllTodos()).filter(t => !t.doneAt);

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector(`[data-test-id="${todo.id}-edit-todo"]`);
    await page.click(`[data-test-id="${todo.id}-edit-todo"]`);
    await page.waitForSelector(
      `[data-test-id="${todo.id}-edit-todo"] #todo-content`
    );
    await page.type(
      `[data-test-id="${todo.id}-edit-todo"] #todo-content`,
      'edited'
    );
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/todo-edited.png')
    );

    const todoHeading = await page.waitForSelector(
      `[data-test-id="${todo.id}-edit-content"]`
    );
    expect(todoHeading).toBeDefined();
    await page.close();
  });
});

describe('add todo', () => {
  test('add dialog opens [@addtodo, @readonly]', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/add-todo-dialog.png')
    );
    await page.close();
  });
});
