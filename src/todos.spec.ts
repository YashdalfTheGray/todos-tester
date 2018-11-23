import { resolve } from 'path';

import { firestore } from 'firebase';
import puppeteer from 'puppeteer';

import {
  createTodo,
  deleteTodo,
  getAllTodos,
  getBrowser,
  getFirestore,
  IFirebaseTodo,
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
  function findAndDeleteNewlyAddedTodo(
    newTodos: IFirebaseTodo[],
    oldTodos: IFirebaseTodo[]
  ) {
    const todoDiff = newTodos.filter(t => oldTodos.includes(t));

    if (todoDiff.length === 0) {
      return;
    }

    return Promise.all(todoDiff.map(t => deleteTodo(t.id)));
  }

  test('add dialog opens [@addtodo, @readonly]', async () => {
    const { TEST_URL } = process.env;

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog"]');
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/add-todo-dialog.png')
    );
    await page.close();
  });

  test('add dialog validates [@addtodo, @readonly]', async () => {
    const { TEST_URL } = process.env;

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog-input"]');
    await page.type(
      '[data-test-id="add-todo-dialog-input"] input',
      'this is a test todo'
    );
    await page.click('[data-test-id="add-todo-dialog"] h2');

    const dialogInvalid = await page.evaluate(() => {
      return (
        document
          .querySelector('[data-test-id="add-todo-dialog-input"] input')
          .getAttribute('aria-invalid') === 'true'
      );
    });

    expect(dialogInvalid).toBeFalsy();

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/filled-add-todo-dialog.png')
    );
    await page.close();
  });

  test('add dialog empty does not validate [@addtodo, @readonly]', async () => {
    const { TEST_URL } = process.env;

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog-input"]');
    await page.click('[data-test-id="add-todo-dialog-input"] input');
    await page.click('[data-test-id="add-todo-dialog"] h2');

    const dialogInvalid = await page.evaluate(() => {
      return (
        document
          .querySelector('[data-test-id="add-todo-dialog-input"] input')
          .getAttribute('aria-invalid') === 'true'
      );
    });

    expect(dialogInvalid).toBeTruthy();
    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/invalid-add-todo-dialog.png')
    );
    await page.close();
  });

  test.skip('add dialog actually adds a todo [@addtodo]', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog-input"]');
    await page.type(
      '[data-test-id="add-todo-dialog-input"] input',
      'this is a test todo'
    );
    await page.click('[data-test-id="add-todo-dialog-create-button"]');
    await waitForNotLoading(page);

    const newTodos = await getAllTodos();
    expect(newTodos).toHaveLength(todos.length + 1);

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/filled-add-todo-dialog.png')
    );
    await page.close();
    await findAndDeleteNewlyAddedTodo(newTodos, todos);
  });

  test('add dialog cancel does not add a todo [@addtodo]', async () => {
    const { TEST_URL } = process.env;
    const todos = await getAllTodos();

    const page = await openApp(browser, TEST_URL);
    await waitForNotLoading(page);
    await page.waitForSelector('div[data-test-id]');
    await page.waitForSelector('[data-test-id="add-todo"]');
    await page.click('[data-test-id="add-todo"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog"]');
    await page.waitForSelector('[data-test-id="add-todo-dialog-input"]');
    await page.type(
      '[data-test-id="add-todo-dialog-input"] input',
      'this is a test todo'
    );
    await page.click('[data-test-id="add-todo-dialog"] h2');
    await page.click('[data-test-id="add-todo-dialog-cancel-button"]');

    expect(await getAllTodos()).toHaveLength(todos.length);

    await screenshot(
      page,
      resolve(process.cwd(), './artifacts/filled-add-todo-dialog.png')
    );
    await page.close();
  });
});
