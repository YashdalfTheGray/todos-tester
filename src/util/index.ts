import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import isDocker from 'is-docker';

export function setupEnvironment() {
  if (!isDocker()) {
    dotenv.config();
  }
}

export async function screenshot(page: puppeteer.Page, path: string) {
  ['screenshot', 'interactive'].includes(process.env.DEBUG)
    ? page.screenshot({ path: path, fullPage: true })
    : null;
}

export async function getBrowser(
  otherOptions?: puppeteer.LaunchOptions
): Promise<puppeteer.Browser> {
  let options: puppeteer.LaunchOptions;

  if (process.env.DEBUG === 'interactive' && !isDocker()) {
    options = { args: ['--no-sandbox'], headless: false, slowMo: 2000 };
  } else {
    options = { args: ['--no-sandbox'] };
  }

  return puppeteer.launch(Object.assign(options, otherOptions));
}

export async function initialize(browser: puppeteer.Browser, url: string) {
  const page = await browser.newPage();

  await page.goto(url);
  await page.setViewport({ height: 768, width: 1200 });

  return page;
}
