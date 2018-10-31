import * as dotenv from 'dotenv';
import isDocker from 'is-docker';
import puppeteer from 'puppeteer';

export {
  initFirebase,
  IFirebaseTodo,
  deleteTodo,
  createTodo,
  getAllTodos,
  getFirestore,
  getFirestoreCollection,
  markTodoDone,
  markTodoUndone,
  updateTodo
} from './firebase';

export function setupEnvironment() {
  if (!isDocker()) {
    dotenv.config();
  }
}

export async function getBrowser(
  otherOptions?: Partial<puppeteer.LaunchOptions>
): Promise<puppeteer.Browser> {
  const options: puppeteer.LaunchOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: isDocker() || process.env.DEBUG !== 'interactive'
  };

  return puppeteer.launch(Object.assign(options, otherOptions));
}

export async function openApp(browser: puppeteer.Browser, url: string) {
  const page = await browser.newPage();

  await page.setViewport({ height: 768, width: 1200 });
  await page.goto(url);

  return page;
}

export async function screenshot(page: puppeteer.Page, path: string) {
  return ['screenshot', 'interactive'].includes(process.env.DEBUG)
    ? page.screenshot({ path, fullPage: true })
    : null;
}
