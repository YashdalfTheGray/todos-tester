# todos-tester

Test package for the [todos app](https://github.com/YashdalfTheGray/todos) using Puppeteer, Jest, Javascript and Docker.

## Setup

This project relies on Docker but can also be run outside of Docker. You will need Docker 1.13.0 CE and/or a Node.js 8.6 or newer and npm v5.6 or newer to run this project.

The first thing to do is to create a file in this directory called `.env` and add some keys to it. The keys are listed below.

The `DEBUG` variable has 3 possible values, `none` which only creates a `manifest.json`, `screenshot` which will take screenshots at the end of each test and `interactive` which will take screenshots and run puppeteer in non-headless mode. The interactive mode doesn't work under Docker so it will be ignored.

```
TEST_URL=<server_url>
DEBUG=<none|screenshot|interactive>
```

Once you have this created, you can either run `npm install` to install all the dependencies or run `docker build -t todos-tester .` to build the image.
